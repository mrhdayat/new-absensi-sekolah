import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/leave-requests/teacher/[id] - Approve/Reject teacher leave request
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

    // Only Principal and Admin can approve/reject
    if (!["PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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
    const existingLeave = await prisma.teacherLeaveRequest.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: { name: true },
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

    // Update leave request
    const updatedLeave = await prisma.teacherLeaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: session.user.id,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
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
        module: "TEACHER_LEAVE_REQUEST",
        recordId: id,
        oldData: { status: existingLeave.status },
        newData: { status, approvedBy: session.user.name, notes },
      },
    });

    // Create notification for teacher
    await prisma.notification.create({
      data: {
        userId: existingLeave.teacher.userId,
        title: `Pengajuan Izin ${status === "APPROVED" ? "Disetujui" : "Ditolak"}`,
        message: `Pengajuan izin Anda dari ${new Date(existingLeave.startDate).toLocaleDateString("id-ID")} sampai ${new Date(existingLeave.endDate).toLocaleDateString("id-ID")} telah ${status === "APPROVED" ? "disetujui" : "ditolak"} oleh ${session.user.name}.`,
        type: status === "APPROVED" ? "SUCCESS" : "WARNING",
        link: "/teacher/leaves",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Error updating teacher leave request:", error);
    return NextResponse.json(
      { error: "Failed to update leave request" },
      { status: 500 }
    );
  }
}
