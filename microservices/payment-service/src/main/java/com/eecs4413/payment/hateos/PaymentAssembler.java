package com.eecs4413.payment.hateos;

import com.eecs4413.payment.controller.PaymentController;
import com.eecs4413.payment.dto.PaymentDetailDTO;
import com.eecs4413.payment.dto.PaymentResponseDTO;
import com.eecs4413.payment.dto.ReceiptResponseDTO;
import org.springframework.hateoas.EntityModel;
import org.springframework.stereotype.Component;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Component
public class PaymentAssembler {

    public EntityModel<PaymentDetailDTO> toDetailModel(PaymentDetailDTO payment) {
        return EntityModel.of(payment,
                linkTo(methodOn(PaymentController.class)
                        .getPayment(payment.getPaymentID(), null))
                        .withSelfRel(),

                linkTo(methodOn(PaymentController.class)
                        .placePayment(null, null))
                        .withRel("pay"),

                linkTo(methodOn(PaymentController.class)
                        .createReceipt(null, null))
                        .withRel("receipt")
        );
    }

    public EntityModel<PaymentResponseDTO> toPaymentResponseModel(PaymentResponseDTO response) {
        return EntityModel.of(response,
                linkTo(methodOn(PaymentController.class)
                        .getPayment(response.getPaymentID(), null))
                        .withRel("payment-detail"),

                linkTo(methodOn(PaymentController.class)
                        .createReceipt(null, null))
                        .withRel("receipt")
        );
    }

    public EntityModel<ReceiptResponseDTO> toReceiptModel(ReceiptResponseDTO receipt, Long paymentId) {
        return EntityModel.of(receipt,
                linkTo(methodOn(PaymentController.class)
                        .getPayment(paymentId, null))
                        .withRel("payment-detail")
        );
    }
}
