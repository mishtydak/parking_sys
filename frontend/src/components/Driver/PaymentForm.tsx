import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/forms.css';

interface PaymentFormProps {
  reservationId: string;
  amount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ reservationId, amount }) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Demo mode: simulate successful payment
    setTimeout(() => {
      setSuccess(true);
      // Redirect after successful payment
      setTimeout(() => {
        navigate('/driver');
      }, 2000);
    }, 1000); // Simulate processing time
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="payment-success">
        <h3>Payment Successful!</h3>
        <p>Your parking reservation has been confirmed.</p>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <h3>Payment Information</h3>
      <p>Total Amount: ₹{amount.toFixed(2)}</p>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method:</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="upi">UPI (PayTM, PhonePe, Google Pay)</option>
            <option value="net_banking">Net Banking</option>
            <option value="digital_wallet">Digital Wallet</option>
          </select>
        </div>
        
        {paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? (
          <>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number:</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date:</label>
                <input
                  type="text"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cvv">CVV:</label>
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </>
        ) : null}
        
        {paymentMethod === 'upi' && (
          <div className="form-group">
            <label htmlFor="upiId">UPI ID:</label>
            <input
              type="text"
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Ex: yourname@upi"
              required
            />
          </div>
        )}
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Processing Payment...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // In a real app, we would fetch reservation details here
  // For this demo, we'll use a fixed amount
  const amount = 75.00; // ₹75 for 2.5 hours parking at ₹30/hour

  return (
    <div className="payment-page">
      <h2>Complete Your Payment</h2>
      {error && <div className="error">{error}</div>}
      
        <PaymentForm reservationId={reservationId || ""} amount={amount} />
    </div>
  );
};

export default PaymentPage;