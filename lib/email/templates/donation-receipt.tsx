import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Hr,
} from '@react-email/components';

interface TransactionReceiptProps {
    donorName: string;
    amount: number;
    purpose: string;
    transactionDate: string;
    transactionId: string;
    isAnonymous?: boolean;
    contactEmail?: string;
    contactPhone?: string;
}

export function TransactionReceipt({
    donorName,
    amount,
    purpose,
    transactionDate,
    transactionId,
    isAnonymous = false,
    contactEmail = '',
    contactPhone = '',
}: TransactionReceiptProps) {
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);

    return (
        <Html>
            <Head />
            <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
                <Container style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    <Section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px' }}>
                        {/* Header */}
                        <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Text style={{ fontSize: '32px', margin: '0' }}>☸️</Text>
                            <Text style={{ fontSize: '24px', color: '#B8860B', fontWeight: 'bold', margin: '10px 0' }}>
                                Hệ thống Quản trị
                            </Text>
                            <Text style={{ fontSize: '16px', color: '#B8860B', margin: '0' }}>
                                BIÊN NHẬN CÚNG DƯỜNG
                            </Text>
                        </Section>

                        {/* Greeting */}
                        <Text style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
                            Kính thư {isAnonymous ? 'Nhân sự ẩn danh' : donorName},
                        </Text>

                        <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
                            Hệ thống chân thành cảm ơn tấm lòng thanh toán của quý Nhân sự.
                        </Text>

                        {/* Receipt Box */}
                        <Section
                            style={{
                                backgroundColor: '#FFF8DC',
                                padding: '25px',
                                borderRadius: '8px',
                                border: '2px solid #B8860B',
                                margin: '25px 0',
                            }}
                        >
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#666', fontSize: '14px' }}>
                                        <strong>Số tiền:</strong>
                                    </td>
                                    <td style={{ padding: '8px 0', color: '#B8860B', fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}>
                                        {formattedAmount}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#666', fontSize: '14px' }}>
                                        <strong>Mục đích:</strong>
                                    </td>
                                    <td style={{ padding: '8px 0', color: '#333', fontSize: '14px', textAlign: 'right' }}>
                                        {purpose}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#666', fontSize: '14px' }}>
                                        <strong>Ngày thanh toán:</strong>
                                    </td>
                                    <td style={{ padding: '8px 0', color: '#333', fontSize: '14px', textAlign: 'right' }}>
                                        {transactionDate}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#666', fontSize: '14px' }}>
                                        <strong>Mã giao dịch:</strong>
                                    </td>
                                    <td style={{ padding: '8px 0', color: '#888', fontSize: '12px', textAlign: 'right', fontFamily: 'monospace' }}>
                                        {transactionId}
                                    </td>
                                </tr>
                            </table>
                        </Section>

                        {/* Thank You Message */}
                        <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.8', textAlign: 'center', fontStyle: 'italic' }}>
                            Giao dịch thanh toán của quý Nhân sự sẽ được sử dụng vào việc hoằng dương Phật pháp,
                            duy trì hoạt động của chi nhánh, và các hoạt động từ thiện phục vụ cộng đồng.
                        </Text>

                        <Hr style={{ margin: '30px 0', borderColor: '#eee' }} />

                        {/* Blessing */}
                        <Text style={{ fontSize: '15px', color: '#B8860B', textAlign: 'center', fontWeight: 'bold' }}>
                            🙏 សាធុ! សាធុ! សាធុ!
                        </Text>
                        <Text style={{ fontSize: '14px', color: '#666', textAlign: 'center', fontStyle: 'italic', marginTop: '10px' }}>
                            Cầu chúc quý Nhân sự luôn an lạc, hạnh phúc, vạn sự như ý
                        </Text>

                        {/* CTA */}
                        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
                            <Button
                                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://chantarangsay.org'}/vi/transactions`}
                                style={{
                                    backgroundColor: '#B8860B',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    fontWeight: 'bold',
                                }}
                            >
                                Xem Lịch Sử Cúng Dường
                            </Button>
                        </Section>

                        {/* Footer */}
                        <Section style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '30px' }}>
                            <Text style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                                Nếu có thắc mắc về biên nhận này, vui lòng liên hệ:
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#B8860B', textAlign: 'center', margin: '5px 0' }}>
                                📧 {contactEmail}<br />
                                📞 {contactPhone}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '15px' }}>
                                Hệ thống Multi-tenant Ecosystem
                            </Text>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
