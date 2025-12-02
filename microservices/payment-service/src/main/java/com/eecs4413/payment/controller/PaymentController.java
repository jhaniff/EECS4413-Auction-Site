package com.eecs4413.payment.controller;
import com.eecs4413.payment.dto.PaymentDetailDTO;
import com.eecs4413.payment.dto.PaymentRequestDTO;
import com.eecs4413.payment.dto.PaymentResponseDTO;
import com.eecs4413.payment.dto.ReceiptResponseDTO;
import com.eecs4413.payment.hateos.PaymentAssembler;
import com.eecs4413.payment.model.Payment;
import com.eecs4413.payment.model.UserPrincipal;
import com.eecs4413.payment.service.PaymentService;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
     private final PaymentService paymentService;
     private final PaymentAssembler paymentAssembler;

     public PaymentController(PaymentService paymentService, PaymentAssembler paymentAssembler){
          this.paymentService = paymentService;
          this.paymentAssembler = paymentAssembler;
     }

     @GetMapping("/{paymentId}")
     public ResponseEntity<EntityModel<PaymentDetailDTO>> getPayment(
             @PathVariable Long paymentId,
             @AuthenticationPrincipal UserPrincipal user) {

          PaymentDetailDTO payment =
                  paymentService.getPaymentDetails(paymentId, user.getUser().getUserId());

          EntityModel<PaymentDetailDTO> model =
                  paymentAssembler.toDetailModel(payment);

          return ResponseEntity.ok(model);
     }


     @PostMapping("/place")
     public ResponseEntity<EntityModel<PaymentResponseDTO>> placePayment(
             @RequestBody PaymentRequestDTO request,
             @AuthenticationPrincipal UserPrincipal user) {

          PaymentResponseDTO response =
                  paymentService.placePayment(request, user.getUser().getUserId());

          EntityModel<PaymentResponseDTO> model =
                  paymentAssembler.toPaymentResponseModel(response);

          return ResponseEntity.ok(model);
     }


     @PostMapping("/receipt")
     public ResponseEntity<EntityModel<ReceiptResponseDTO>> createReceipt(
             @RequestBody Payment payment,
             @AuthenticationPrincipal UserPrincipal user) {

          ReceiptResponseDTO receipt =
                  paymentService.createReceipt(payment.getPaymentID(), user.getUser().getUserId());

          EntityModel<ReceiptResponseDTO> model =
                  paymentAssembler.toReceiptModel(receipt, payment.getPaymentID());

          return ResponseEntity.ok(model);
     }

}
