package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type resendEmailRequest struct {
	From    string `json:"from"`
	To      []string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
}

func SendOTPEmail(
	email string,
	otp string,
	apiKey string,
	from string,
) error {

	payload := resendEmailRequest{
		From: []string{from}[0],
		To: []string{
			email,
		},
		Subject: "PULSE Email Verification OTP",
		HTML: fmt.Sprintf(`
			<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
				<h1 style="color:#FFD21F;background:#111;padding:20px">
					PULSE
				</h1>

				<h2>Email Verification</h2>

				<p>Your PULSE verification OTP is:</p>

				<div style="
					font-size:32px;
					font-weight:bold;
					letter-spacing:8px;
					padding:20px;
					background:#f5f5f5;
					text-align:center;
					margin:20px 0;
				">
					%s
				</div>

				<p>This OTP is valid for 10 minutes.</p>

				<p>If you did not request this code, you can ignore this email.</p>
			</div>
		`, otp),
	}

	body, err := json.Marshal(payload)

	if err != nil {
		return err
	}

	req, err := http.NewRequest(
		"POST",
		"https://api.resend.com/emails",
		bytes.NewBuffer(body),
	)

	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}

	response, err := client.Do(req)

	if err != nil {
		return err
	}

	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		var responseBody bytes.Buffer
		_, _ = responseBody.ReadFrom(response.Body)

		return fmt.Errorf(
			"Resend API returned %d: %s",
			response.StatusCode,
			responseBody.String(),
		)
	}

	return nil
}