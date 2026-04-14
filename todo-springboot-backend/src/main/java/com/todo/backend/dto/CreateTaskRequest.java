package com.todo.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTaskRequest {
  @NotBlank
  @Size(max = 200)
  private String title;

  public CreateTaskRequest() {}

  public CreateTaskRequest(String title) {
    this.title = title;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }
}

