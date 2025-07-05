package com.example.pai.dao.repository;




import com.example.pai.dao.model.UserManagment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserManagment, UUID> {
    Optional<UserManagment> findByEmail(String email);
    boolean existsByEmail(String email);
}
