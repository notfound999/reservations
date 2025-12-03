package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.UserDto;
import com.myapp.reservations.Mappers.UserMapper;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.entities.Role;
import com.myapp.reservations.entities.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {


    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDto)
                .collect(Collectors.toList());
    }


    public UserDto findByName(String name){
        if(name==null){
            return null;
        }
        Optional<User> user = userRepository.findByName(name);
        return user.map(UserMapper::toDto).orElse(null);
    }


    public UserDto findById(UUID id) {

        if(id==null){
            return null;
        }
        Optional<User> user = userRepository.findById(id);
        return user.map(UserMapper::toDto).orElse(null);

    }

    public UserDto findByEmail(String email){
        if(email==null){
            return null;
        }
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(UserMapper::toDto).orElse(null);
    }

    public boolean existsByEmail(String email){
        if(email==null){
            return false;
        }
        Optional<User> user = userRepository.findByEmail(email);
        return user.isPresent();
    }

    public UserDto save(UserDto userDto) {
        if(userDto == null) return null;
        User user = UserMapper.toUser(userDto);
        user.setPassword("password");
        User savedUser = userRepository.save(user);
        return UserMapper.toDto(savedUser);
    }

    public List<UserDto> getUsersByRole(Role role) {
        if(role==null){
            return null;
        }
        return userRepository.findByRole(role)
                .stream()
                .map(UserMapper::toDto)
                .toList();
        }



}
