package com.eecs4413.auction.exception;

public class InvalidBidException extends RuntimeException{
    public InvalidBidException(String message) {
        super(message);
    }
}
