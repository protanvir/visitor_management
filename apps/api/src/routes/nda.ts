import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";

const router = Router();

// NDA template
const ndaTemplate = {
  title: "NON-DISCLOSURE AGREEMENT",
  company: "Aptech Group",
  content: `
This Non-Disclosure Agreement ("Agreement") is entered into as of the date of signature below, by and between:

**Aptech Group** ("Company"), and the undersigned visitor ("Recipient").

## 1. Purpose
The Recipient desires to visit the Company's premises for the purpose of: [VISIT_PURPOSE]

## 2. Confidential Information
"Confidential Information" means any information disclosed by the Company to the Recipient, either directly or indirectly, including but not limited to:
- Trade secrets, inventions, patents, copyrights, and other intellectual property
- Business plans, strategies, and financial information
- Customer and supplier lists
- Technical data, designs, and specifications
- Manufacturing processes and techniques
- Any other information marked as "Confidential" or that reasonably should be understood to be confidential

## 3. Obligations
The Recipient agrees to:
- Hold all Confidential Information in strict confidence
- Not disclose any Confidential Information to third parties
- Use the Confidential Information solely for the purpose of the visit
- Take all reasonable measures to protect the confidentiality of such information
- Not copy, reproduce, or duplicate any Confidential Information

## 4. Term
This Agreement shall remain in effect for a period of [TERM] years from the date of signature.

## 5. Return of Materials
Upon termination of the visit or upon request by the Company, the Recipient shall promptly return all documents, materials, and other tangible items containing Confidential Information.

## 6. Remedies
The Recipient acknowledges that any breach of this Agreement may cause irreparable harm to the Company for which monetary damages may be inadequate. The Company shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.

## 7. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the Company operates.

## 8. Entire Agreement
This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, and negotiations, both written and oral.

**IN WITNESS WHEREOF**, the parties have executed this Agreement as of the date last signed below.
`,
};

// Get NDA template
router.get("/template", async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: ndaTemplate });
  } catch (error) {
    console.error("Error fetching NDA template:", error);
    res.status(500).json({ success: false, error: "Failed to fetch NDA template" });
  }
});

// Get NDA status for a visit
router.get("/visit/:visitId", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: {
        id: true,
        ndaSigned: true,
        visitor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    res.json({
      success: true,
      data: {
        visitId: visit.id,
        ndaSigned: visit.ndaSigned,
        visitorName: visit.visitor.name,
        visitorEmail: visit.visitor.email,
      },
    });
  } catch (error) {
    console.error("Error fetching NDA status:", error);
    res.status(500).json({ success: false, error: "Failed to fetch NDA status" });
  }
});

// Sign NDA
const signNdaSchema = z.object({
  visitorName: z.string().min(1, "Visitor name is required"),
  visitorEmail: z.string().email("Valid email is required"),
  signature: z.string().min(1, "Signature is required"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

router.post("/visit/:visitId/sign", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;
    const validatedData = signNdaSchema.parse(req.body);

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
      },
    });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    // Verify visitor identity
    if (
      visit.visitor.name !== validatedData.visitorName ||
      visit.visitor.email !== validatedData.visitorEmail
    ) {
      return res.status(400).json({
        success: false,
        error: "Visitor identity does not match",
      });
    }

    // Update visit with NDA signed status
    await prisma.visit.update({
      where: { id: visitId },
      data: { ndaSigned: true },
    });

    // In production, you would:
    // 1. Store the signed NDA document
    // 2. Record the signature timestamp
    // 3. Generate a PDF of the signed NDA

    res.json({
      success: true,
      message: "NDA signed successfully",
      data: {
        visitId,
        signedAt: new Date().toISOString(),
        visitorName: validatedData.visitorName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }
    console.error("Error signing NDA:", error);
    res.status(500).json({ success: false, error: "Failed to sign NDA" });
  }
});

// Get signed NDA (for download)
router.get("/visit/:visitId/download", async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        site: true,
      },
    });

    if (!visit) {
      return res.status(404).json({ success: false, error: "Visit not found" });
    }

    if (!visit.ndaSigned) {
      return res.status(400).json({ success: false, error: "NDA has not been signed" });
    }

    // In production, you would generate a PDF with the signature
    // For now, return the NDA content
    const signedNda = {
      ...ndaTemplate,
      signedBy: visit.visitor.name,
      signedAt: visit.updatedAt.toISOString(),
      siteName: visit.site.name,
      purpose: visit.purpose || "General Visit",
    };

    res.json({ success: true, data: signedNda });
  } catch (error) {
    console.error("Error downloading NDA:", error);
    res.status(500).json({ success: false, error: "Failed to download NDA" });
  }
});

export default router;
