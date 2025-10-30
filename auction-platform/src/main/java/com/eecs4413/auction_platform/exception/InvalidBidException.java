package com.eecs4413.auction_platform.exception;

public class InvalidBidException extends RuntimeException{
    public InvalidBidException(String message) {
        super(message);
    }
}
