package com.todo.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateTaskRequest {
  @NotBlank
  @Size(max = 200)
  private String title;

  @NotNull
  private Boolean completed;

  public UpdateTaskRequest() {}

  public UpdateTaskRequest(String title, Boolean completed) {
    this.title = title;
    this.completed = completed;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public Boolean getCompleted() {
    return completed;
  }

  public void setCompleted(Boolean completed) {
    this.completed = completed;
  }
}

