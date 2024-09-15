package pong.kollaboraatioterminaali;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PongApplication {

    public static void main(String[] args) {
        SpringApplication.run(PongApplication.class, args);
    }

    @Bean
    public CommandLineRunner run(Pong pong) {
        return args -> pong.start();
    }
}
