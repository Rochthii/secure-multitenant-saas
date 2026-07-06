import { createHash } from 'crypto';

export interface AuditBlock {
    logId: string;
    tenantId: string;
    userEmail: string;
    action: string;
    tableName: string;
    recordId: string;
    severity: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    riskScore: number;
    timestamp: string;
    prevBlockHash: string;
}

/**
 * Hàm tính toán mã băm SHA-256 của một Block kiểm toán (WORM Cryptographic Chain)
 */
export function calculateBlockHash(block: Omit<AuditBlock, 'prevBlockHash'> & { prevBlockHash: string }): string {
    const rawString = `${block.logId}-${block.tenantId}-${block.userEmail}-${block.action}-${block.tableName}-${block.recordId}-${block.severity}-${JSON.stringify(block.details)}-${block.ipAddress}-${block.userAgent}-${block.riskScore}-${block.timestamp}-${block.prevBlockHash}`;
    return createHash('sha256').update(rawString).digest('hex');
}

/**
 * Đẩy tệp JSON cấu trúc Block kiểm toán lên mạng IPFS thông qua Pinata API
 * Trả về CID (Content Identifier) duy nhất
 */
export async function uploadToIPFS(block: AuditBlock): Promise<string> {
    const jwtToken = process.env.PINATA_JWT;
    if (!jwtToken) {
        throw new Error('Chưa cấu hình PINATA_JWT trong tệp môi trường.');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
            pinataContent: block,
            pinataMetadata: {
                name: `WORM-Log-${block.logId}`,
                keyvalues: {
                    tenant_id: block.tenantId,
                    action: block.action
                }
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi kết nối Pinata Gateway: ${errorText}`);
    }

    const result = await response.json();
    return result.IpfsHash; // CID ví dụ: QmXoypizjW3WknFixtnd...
}

/**
 * Đọc nội dung block từ mạng IPFS thông qua Gateway của Pinata
 */
export async function readFromIPFS(cid: string): Promise<AuditBlock> {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
    const response = await fetch(`${gateway}${cid}`, {
        next: { revalidate: 3600 } // Cache kết quả đọc
    });

    if (!response.ok) {
        throw new Error(`Không thể tải dữ liệu từ IPFS Gateway cho CID: ${cid}`);
    }

    return await response.json();
}
