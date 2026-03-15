import "../Privacy/Privacy.css";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> Back to Home
        </Link>
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last Updated: 15 March 2026</p>
        <p className="last-updated">Welcome to Arambh. These Terms and Conditions (“Terms”) govern your use of the website https://www.arambhonline.com and the services provided through it.
          By accessing or using the Service, you agree to be bound by these Terms.</p>

        <section className="policy-section">
          <h2>1. Definitions</h2>
          <p>
            “Service” refers to the SaaS platform provided by Arambh that helps small cafés and restaurants manage business operations such as billing and related activities.

            “User”, “you”, or “your” refers to any person or business accessing or using the Service.

            “We”, “our”, or “us” refers to Arambh, operated by an individual owner.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Eligibility</h2>
          <p>
            By using this Service, you confirm that:
          </p>
          <ul>
            <li>You are at least 18 years old, or if you are under 18, you are using the service for business purposes with parental or guardian consent.</li>
            <li>You are legally authorized to use the Service for business purposes.</li>
            <li>You will use the Service only for lawful purposes related to your business operations.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Account Registration</h2>
          <p>
            To access certain features of the Service, users may be required to create an account.
          </p>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and complete information during registration.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Be responsible for all activities that occur under your account.</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts with inaccurate or misleading information.</p>
        </section>

        <section className="policy-section">
          <h2>4. Description of the Service</h2>
          <p>
            Arambh provides a software platform designed to assist small cafés and restaurants
            with managing operational tasks such as billing and related business processes.
            <br />
            We may modify, update, or discontinue features of the Service at any time without prior notice.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Subscription and Payments</h2>
          <p>
            Certain features of the Service may require a paid subscription.
            <br />
            Users may choose subscription plans made available on the platform.
            <br />
            Subscriptions may be billed on a monthly, bi-annually or annual basis.
            <br />
            Users may cancel their subscription at any time.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Refund Policy</h2>
          <p>
            For users who purchase an <b>annual subscription plan, a 70% refund may be provided if the subscription is cancelled within the first two months</b> of the purchase.
            <br />
            Refund requests must be submitted through the support email.
            <br />
            Refunds may take 5-7 business days to process depending on the payment provider.
            <br />
            No refunds will be provided for cancellations made after the first two months.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Acceptable Use</h2>
          <p>
            Users agree not to:
          </p>
          <ul>
            <li>Use the Service for unlawful purposes.</li>
            <li>Attempt to disrupt or compromise the platform’s security.</li>
            <li>Upload malicious software or harmful files.</li>
            <li>Attempt to gain unauthorized access to other accounts or systems.</li>
          </ul>
          <p>Violation of these rules may result in immediate account suspension or termination.</p>
        </section>

        <section className="policy-section">
          <h2>8. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate user accounts at our discretion if:
          </p>
          <ul>
            <li>The user violates these Terms.</li>
            <li>The user engages in fraudulent or abusive behavior.</li>
            <li>The Service is used in a way that may harm the platform or other users.</li>
          </ul>
          <p>Users may also terminate their accounts at any time.</p>
        </section>

        <section className="policy-section">
          <h2>9. Intellectual Property</h2>
          <p>
            All content, software, branding, and design elements of the Service are the intellectual property of Arambh unless otherwise stated.
            <br />
            Users may not copy, distribute, modify, or reproduce any part of the Service without prior written permission.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Limitation of Liability</h2>
          <p>
            The Service is provided on an “as is” and “as available” basis.
            <br />
            Arambh shall not be liable for:
          </p>
          <ul>
            <li>Any business losses</li>
            <li>Loss of profits or revenue</li>
            <li>Data loss or service interruptions</li>
            <li>Any indirect or consequential damages arising from the use of the Service</li>
          </ul>
          <p>Users are responsible for verifying the accuracy of information generated through the platform.</p>
        </section>

        <section className="policy-section">
          <h2>11. Disclaimer</h2>
          <p>
            While we strive to provide reliable software for managing business operations, Arambh does not guarantee that the Service will be error-free or uninterrupted.
            <br />
            The platform should not be considered a substitute for professional accounting, financial, or legal advice.
            <br />
            Users are responsible for ensuring that their business operations comply with applicable laws and regulations.
          </p>
        </section>

        <section className="policy-section">
          <h2>12. Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy available on the website.
          </p>
        </section>

        <section className="policy-section">
          <h2>13. Changes to the Terms</h2>
          <p>
            We may update these Terms from time to time.
            <br />
            Updated terms will be posted on this page with a revised “Last Updated” date.
            <br />
            Continued use of the Service after changes indicates acceptance of the updated Terms.
          </p>
        </section>

        <section className="policy-section">
          <h2>14. Governing Law</h2>
          <p>
            These Terms shall be governed and interpreted in accordance with the laws of India.
            <br />Any disputes arising from these Terms shall be subject to the jurisdiction of courts located in India.
          </p>
        </section>

        <section className="policy-section">
          <h2>15. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact:
            <br />
            Email: support@arambhonline.com
          </p>
        </section>

      </div>
    </div>
  );
};

export default Terms;
