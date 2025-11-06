/**
 * API Route: Verify Admin Password
 * POST /api/verify-admin
 * Verifies the admin password for QR generator access
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface VerifyResponse {
  success: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { password } = req.body;

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Verify password
    if (password === adminPassword) {
      return res.status(200).json({
        success: true,
        message: 'Access granted'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

  } catch (error: any) {
    console.error('Error verifying admin password:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

