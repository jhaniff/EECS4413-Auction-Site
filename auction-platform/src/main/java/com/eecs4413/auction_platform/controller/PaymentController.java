package com.eecs4413.auction_platform.controller;
import com.eecs4413.auction_platform.dto.AuctionDTO;
import com.eecs4413.auction_platform.dto.AuctionDetailDTO;
import com.eecs4413.auction_platform.dto.PaymentDTO;
import com.eecs4413.auction_platform.dto.PaymentDetailDTO;
import com.eecs4413.auction_platform.service.AuctionService;
import com.eecs4413.auction_platform.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auction")
public class PaymentController {
     private final PaymentService paymentService;

     public PaymentController(PaymentService paymentService){
          this.paymentService = paymentService;
     }

     @GetMapping("/{paymentId}")
     public ResponseEntity<PaymentDetailDTO> getAuction(@PathVariable Long paymentId){
          return ResponseEntity.ok(paymentService.getPaymentDetails(paymentId));
     }

}
