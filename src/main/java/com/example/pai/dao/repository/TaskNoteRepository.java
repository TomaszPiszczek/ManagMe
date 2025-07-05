package com.example.pai.dao.repository;

import com.example.pai.dao.model.TaskNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskNoteRepository extends JpaRepository<TaskNote, UUID> {

    @Query("SELECT tn FROM TaskNote tn WHERE tn.task.id = :taskId ORDER BY tn.creationTimestamp ASC")
    List<TaskNote> findByTaskIdOrderByCreationTimestamp(@Param("taskId") UUID taskId);

    @Query("SELECT tn FROM TaskNote tn WHERE tn.task.id = :taskId AND tn.user.id = :userId ORDER BY tn.creationTimestamp ASC")
    List<TaskNote> findByTaskIdAndUserIdOrderByCreationTimestamp(@Param("taskId") UUID taskId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(tn) FROM TaskNote tn WHERE tn.task.id = :taskId")
    Long countByTaskId(@Param("taskId") UUID taskId);
}