package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.UserDto;
import com.myapp.reservations.entities.User;

public class UserMapper {

    public static UserDto toDto(User user) {
        if(user==null){
            return null;
        }
        UserDto userDto = new UserDto(user.getId(),user.getName(),user.getEmail());
        return userDto;
    }

    public static  User toUser(UserDto userDto) {
        if(userDto==null){
            return null;
        }
        User user = new User();
        user.setName(userDto.name());
        user.setEmail(userDto.email());
        return user;
    }

}
