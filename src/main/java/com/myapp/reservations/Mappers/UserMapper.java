package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.UserRequest;
import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.entities.Role;
import com.myapp.reservations.entities.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        if(user==null){
            return null;
        }
        return new UserResponse(user.getId(),user.getName(),user.getEmail(),user.getPhone(),user.getRole(),user.getCreatedAt(),user.getCreatedAt() );
    }

    public static User toUser(UserRequest request) {
        if (request == null) return null;
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(request.password());
        if (request.role() != null) {
            user.setRole(Enum.valueOf(Role.class, request.role()));
        }
        user.setPhone(request.phone());
        return user;
    }
}
