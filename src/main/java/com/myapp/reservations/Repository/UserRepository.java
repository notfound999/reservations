package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.Role;
import com.myapp.reservations.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    User findByName(String name);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByName(String name);
    Optional<User> findByRoles(Role role);

}
