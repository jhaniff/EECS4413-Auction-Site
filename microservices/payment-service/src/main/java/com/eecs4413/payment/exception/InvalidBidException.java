package com.eecs4413.payment.exception;

public class InvalidBidException extends RuntimeException{
    public InvalidBidException(String message) {
        super(message);
    }
}
