import React, { useRef } from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import darkLogo from '../../assets/seekmycourse_dark_logo.png'; // Make sure this path is correct

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

const InvoiceContainer = styled.div`
    padding: 1rem;
    background: #fff;
`;

const InvoiceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 1rem;
`;

const Logo = styled.img`
    width: 150px;
`;

const InvoiceInfo = styled.div`
    text-align: right;
`;

const Section = styled.div`
    margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
    margin-bottom: 1rem;
    color: #555;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
`;

const BillingDetails = styled.div`
    /* No longer a grid, elements will stack */
`;

const Address = styled.div`
    line-height: 1.6;
    margin-bottom: 1.5rem; /* Add some space between the two address blocks */
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    th, td {
        padding: 0.8rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f7f7f7;
    }
`;

const TotalSection = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const TotalTable = styled.table`
    width: 50%;
    border-collapse: collapse;
    
    td {
        padding: 0.8rem;
        border-bottom: 1px solid #ddd;
    }

    tr:last-child td {
        border-bottom: none;
    }
`;

const ButtonControls = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    gap: 1rem;
`;

const Button = styled.button`
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;

    &.close {
        background-color: #6c757d;
        color: white;
    }

    &.download {
        background-color: #007bff;
        color: white;
    }
`;

const InvoiceModal = ({ isOpen, onClose, invoiceDetails, userDetails }) => {
    const invoiceRef = useRef();

    const handleDownloadPdf = () => {
        const input = invoiceRef.current;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-SMC-${invoiceDetails?.subscriptionId}.pdf`);
        });
    };

    const formatBillingAddress = (address) => {
        if (!address || typeof address !== 'object' || Object.keys(address).length === 0) {
            return 'No billing address provided';
        }
        const parts = [
            address.addressLine1,
            address.addressLine2,
            address.city,
            address.state,
            address.zipCode,
            address.country
        ];
        return parts.filter(part => part).join(', ');
    };

    if (!isOpen || !invoiceDetails || !userDetails) {
        return null;
    }
    
    // Calculate totals since they aren't passed from the admin panel directly
    const gstRate = 0.18;
    const subtotal = invoiceDetails.plan.amount || 0;
    const gst = subtotal * gstRate;
    const total = subtotal + gst;

    const { plan, endDate, subscriptionId, startDate } = invoiceDetails;

    return (
        <ModalBackdrop>
            <ModalContent>
                <InvoiceContainer ref={invoiceRef}>
                    <InvoiceHeader>
                        <Logo src={darkLogo} alt="SeekMyCourse" />
                        <InvoiceInfo>
                            <h2>Invoice</h2>
                            <p><strong>Invoice #:</strong> SMC-{subscriptionId}</p>
                            <p><strong>Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
                        </InvoiceInfo>
                    </InvoiceHeader>

                    <Section>
                        <BillingDetails>
                            <Address>
                                <SectionTitle>Bill From</SectionTitle>
                                <p><strong>SeekMyCourse AI Technologies Pvt Ltd</strong></p>
                            </Address>
                            <Address>
                                <SectionTitle>Bill To</SectionTitle>
                                <p><strong>{userDetails.firstName} {userDetails.lastName}</strong></p>
                                <p>{userDetails.email}</p>
                                <p>{formatBillingAddress(userDetails.billingAddress)}</p>
                            </Address>
                        </BillingDetails>
                    </Section>

                    <Section>
                        <SectionTitle>Plan Details</SectionTitle>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>{plan.name}</strong>
                                        <ul>
                                            <li>{plan.coursesPerMonth} Courses per Month</li>
                                            <li>{plan.subtopicsPerCourse} Subtopics per Course</li>
                                        </ul>
                                        <small><em>Expires on: {new Date(endDate).toLocaleDateString()}</em></small>
                                    </td>
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
                                    <td>GST ({(gstRate * 100).toFixed(0)}%):</td>
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