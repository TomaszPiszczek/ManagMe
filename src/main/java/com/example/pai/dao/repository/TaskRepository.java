package com.example.pai.dao.repository;

import com.example.pai.dao.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectId(UUID projectId);
    List<Task> findByAssignedUserId(UUID assignedUserId);
    List<Task> findByProjectIdAndAssignedUserId(UUID projectId, UUID assignedUserId);
}