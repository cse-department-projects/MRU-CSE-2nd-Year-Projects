package com.resqnet.dto.task;

import com.resqnet.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTaskStatusRequest {

    @NotNull(message = "Task status is required")
    private TaskStatus status;

    private String completionNotes;

    public UpdateTaskStatusRequest() {
    }

    public UpdateTaskStatusRequest(TaskStatus status, String completionNotes) {
        this.status = status;
        this.completionNotes = completionNotes;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }
}
