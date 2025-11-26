package com.eecs4413.payment.controller;
import com.eecs4413.payment.dto.PaymentDetailDTO;
import com.eecs4413.payment.dto.PaymentRequestDTO;
import com.eecs4413.payment.dto.PaymentResponseDTO;
import com.eecs4413.payment.dto.ReceiptResponseDTO;
import com.eecs4413.payment.model.Payment;
import com.eecs4413.payment.model.UserPrincipal;
import com.eecs4413.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
     private final PaymentService paymentService;

     public PaymentController(PaymentService paymentService){
          this.paymentService = paymentService;
     }

     @GetMapping("/{paymentId}")
     public ResponseEntity<PaymentDetailDTO> getPayment(@PathVariable Long paymentId,  @AuthenticationPrincipal UserPrincipal user){
          return ResponseEntity.ok(paymentService.getPaymentDetails(paymentId, user.getUser().getUserId()));
     }

     @PostMapping("/place")
     public ResponseEntity<PaymentResponseDTO> placePayment(@RequestBody PaymentRequestDTO request, @AuthenticationPrincipal UserPrincipal user){
          return ResponseEntity.ok(paymentService.placePayment(request, user.getUser().getUserId()));
     }
     @PostMapping("/receipt")
     public ResponseEntity<ReceiptResponseDTO> createReceipt(@RequestBody Payment payment, @AuthenticationPrincipal UserPrincipal user){
          return ResponseEntity.ok(paymentService.createReceipt(payment, user.getUser().getUserId()));
     }

}
