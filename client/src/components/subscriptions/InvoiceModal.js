// client/src/components/subscriptions/InvoiceModal.js
import React, { useRef } from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import darkLogo from '../../assets/seekmycourse_dark_logo.png';

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: #fff;
    color: #333;
    padding: 2rem;
    border-radius: 8px;
    width: 800px;
    max-height: 90vh;
    overflow-y: auto;
`;

// --- FIX: Removed fixed width and height to prevent scrollbars ---
const InvoiceContainer = styled.div`
    /* This container will be used for PDF generation */
    padding: 1rem; /* Use screen-friendly padding */
    background: #fff;
`;

const InvoiceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #eee;
    padding-bottom: 1rem;
`;

const Logo = styled.img`
    width: 150px;
`;

const InvoiceDetails = styled.div`
    text-align: right;
`;

const Section = styled.div`
    margin-top: 2rem;
`;

const SectionTitle = styled.h3`
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #eee;
    }
    th {
        background-color: #f9f9f9;
    }
`;

const TotalSection = styled.div`
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
`;

const TotalTable = styled.table`
    width: 300px;
    td {
        padding: 0.5rem;
    }
`;

const ButtonControls = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
`;

const Button = styled.button`
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &.download {
        background-color: #03AC9A;
        color: white;
    }
    &.close {
        background-color: #ccc;
        color: #333;
    }
`;

const InvoiceModal = ({ invoice, onClose }) => {
    const invoiceRef = useRef();

    if (!invoice) return null;

    const { user, plan, startDate, razorpay_payment_id, subscriptionId } = invoice;
    const subtotal = plan.amount;
    const gstRate = 0.18;
    const gst = subtotal * gstRate;
    const total = subtotal + gst;
    const displayInvoiceId = (subscriptionId || 0) + 1000;

    const handleDownloadPdf = () => {
        const input = invoiceRef.current;
        html2canvas(input, { 
            scale: 2, 
            useCORS: true,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            const pageAspectRatio = pdfWidth / pdfHeight;
            
            let imgWidth = pdfWidth;
            let imgHeight = pdfWidth / canvasAspectRatio;

            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = pdfHeight * canvasAspectRatio;
            }

            const margin = 10;
            const effectiveWidth = pdfWidth - (margin * 2);
            const effectiveHeight = (canvas.height * effectiveWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', margin, margin, effectiveWidth, effectiveHeight);
            pdf.save(`invoice-${displayInvoiceId}.pdf`);
        });
    };

    return (
        <ModalBackdrop>
            <ModalContent>
                <InvoiceContainer ref={invoiceRef}>
                    <InvoiceHeader>
                        <div>
                            <Logo src={darkLogo} alt="SeekMyCourse Logo" />
                            <p>SeekMyCourse AI Technologies Pvt Ltd</p>
                        </div>
                        <InvoiceDetails>
                            <h2>Invoice</h2>
                            <p><strong>Invoice #:</strong> SMC-{displayInvoiceId}</p> 
                            <p><strong>Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
                        </InvoiceDetails>
                    </InvoiceHeader>

                    <Section>
                        <SectionTitle>Billed To</SectionTitle>
                        <p>{user.firstName} {user.lastName}</p>
                        {user.billingAddress?.addressLine1 ? (
                            <>
                                <p>{user.billingAddress.addressLine1}</p>
                                {user.billingAddress.addressLine2 && <p>{user.billingAddress.addressLine2}</p>}
                                <p>{user.billingAddress.city}, {user.billingAddress.state} {user.billingAddress.zipCode}</p>
                                <p>{user.billingAddress.country}</p>
                            </>
                        ) : (
                            <p>No billing address provided.</p>
                        )}
                    </Section>
                    
                    <Section>
                        <SectionTitle>Payment Details</SectionTitle>
                        <p><strong>Transaction ID:</strong> {razorpay_payment_id}</p>
                    </Section>

                    <Section>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Plan Name</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{plan.name}</td>
                                    <td>₹{subtotal.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Section>

                    <TotalSection>
                        <TotalTable>
                            <tbody>
                                <tr>
                                    <td>Subtotal:</td>
                                    <td>₹{subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>GST ({gstRate * 100}%):</td>
                                    <td>₹{gst.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total:</strong></td>
                                    <td><strong>₹{total.toFixed(2)}</strong></td>
                                </tr>
                            </tbody>
                        </TotalTable>
                    </TotalSection>
                </InvoiceContainer>

                <ButtonControls>
                    <Button className="close" onClick={onClose}>Close</Button>
                    <Button className="download" onClick={handleDownloadPdf}>Download PDF</Button>
                </ButtonControls>
            </ModalContent>
        </ModalBackdrop>
    );
};

export default InvoiceModal;