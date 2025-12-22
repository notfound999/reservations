package com.myapp.reservations.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
@Slf4j
public class JwtUtil {

    private final String jwtSecret ="1f360178aaa419e59d0feff13cc0f42ba4897ed477bc32c33c2fbb00e37db954";
    Key key =Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

    public String  generateToken(String user){
        return Jwts.builder()
                .subject(user)
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime()+36000000))
                .signWith(key)
                .compact();
    }

    public String getUserFromToken(String token){
        return Jwts.parser().verifyWith((SecretKey) key).build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Boolean validateToken(String token){
        try{
            Jwts.parser().verifyWith((SecretKey) key).build().parseSignedClaims(token);
            return true;
        }catch (Exception e){
            log.error("JWT  VALIDATION ERROR : {} " , e.getMessage());
        }
        return false;
    }
}
