package com.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseObject<T> extends ResponseEntity<ResponseObject.Payload<T>> {

    public ResponseObject(HttpStatus status, String message, T data) {
        super(new Payload<>(status.value(), message, data), status);
    }

    @Builder
    @Getter
    public static class Payload<T> {
        private final int code;
        private final String message;

        @JsonInclude(JsonInclude.Include.NON_NULL)
        private final T data;

        public Payload(int code, String message, T data) {
            this.code = code;
            this.message = message;
            this.data = data;
        }
    }
}
