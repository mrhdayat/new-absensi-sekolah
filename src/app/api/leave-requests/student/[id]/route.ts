import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/leave-requests/student/[id] - Approve/Reject student leave request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Homeroom Teacher, Admin, and Super Admin can approve/reject
    if (!["HOMEROOM_TEACHER", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    // Get existing leave request
    const existingLeave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
            class: {
              select: {
                id: true,
                homeroomTeacherId: true,
              },
            },
          },
        },
      },
    });

    if (!existingLeave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (existingLeave.status !== "PENDING") {
      return NextResponse.json(
        { error: "Leave request already processed" },
        { status: 400 }
      );
    }

    // If homeroom teacher, verify they are the homeroom teacher of the student's class
    if (session.user.role === "HOMEROOM_TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher || existingLeave.student.class?.homeroomTeacherId !== teacher.id) {
        return NextResponse.json(
          { error: "You can only approve leaves for your homeroom class students" },
          { status: 403 }
        );
      }
    }

    // Update leave request
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: session.user.id,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            class: {
              select: {
                name: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: status === "APPROVED" ? "APPROVE" : "REJECT",
        module: "STUDENT_LEAVE_REQUEST",
        recordId: id,
        oldData: { status: existingLeave.status },
        newData: { status, approvedBy: session.user.name, notes },
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: existingLeave.student.userId,
        title: `Pengajuan Izin ${status === "APPROVED" ? "Disetujui" : "Ditolak"}`,
        message: `Pengajuan izin Anda dari ${new Date(existingLeave.startDate).toLocaleDateString("id-ID")} sampai ${new Date(existingLeave.endDate).toLocaleDateString("id-ID")} telah ${status === "APPROVED" ? "disetujui" : "ditolak"} oleh ${session.user.name}.`,
        type: status === "APPROVED" ? "SUCCESS" : "WARNING",
        link: "/student/leaves",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Error updating student leave request:", error);
    return NextResponse.json(
      { error: "Failed to update leave request" },
      { status: 500 }
    );
  }
}
