import "./Privacy.css";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> Back to Home
        </Link>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: 15 March 2026</p>
        <p className="last-updated">Arambh (“we”, “our”, or “us”) operates the website https://www.arambhonline.com (the “Service”). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          By accessing or using the website, you agree to the collection and use of information in accordance with this policy.</p>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <div>
            We may collect the following types of personal information from users:
            <ul>
              <li><b>Personal Identification Information</b>: Name, email address, phone number, and postal address.</li>
              <li><b>Account Information</b>: Username, password, and account settings.</li>
              <li><b>Business Information</b>: Business name, type, and location.</li>
            </ul>
            <br />
            <p><b>Payment Information</b>:Although the platform currently does not process payments directly, subscription-related information may be collected when such functionality is enabled.</p>
            <br />
            <p><b>User Content</b>: Users may optionally upload files while using the platform.</p>
            <br />
            <p><b>Technical Data</b>: Through analytics tools, we may collect limited technical data such as:</p>
            <ul>
              <li><b>IP Address</b>: Your device's internet protocol address.</li>
              <li><b>Device information</b>: Device type, model, and operating system.</li>
              <li><b>Usage Data</b>: Information about how you use the Service, including pages visited and time spent on pages.</li>
            </ul>
          </div>
        </section>

        <section className="policy-section">
          <h2>2. How We Collect Information</h2>
          <p>
            We collect information through:
          </p>
          <ul>
            <li>Account registration forms</li>
            <li>Contact forms on the website</li>
            <li>User interactions within the platform</li>
            <li>File uploads submitted voluntarily by users</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <p>
            We use the collected information for the following purposes:
          </p>
          <ul>
            <li>To create and manage user accounts</li>
            <li>To provide and maintain the SaaS service</li>
            <li>To communicate with users regarding their accounts</li>
            <li>To improve the platform and services</li>
            <li>To respond to customer support requests</li>
            <li>To comply with legal obligations under applicable Indian laws</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Analytics</h2>
          <p>
            We use Google Analytics to understand how visitors interact with our website. Google Analytics may collect information such as:
          </p>
          <ul>
            <li>Pages visited</li>
            <li>Time spent on pages</li>
            <li>Device and browser type</li>
          </ul>
          <p>This information is used to improve the website and services.</p>
        </section>

        <section className="policy-section">
          <h2>5. Data Storage and Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect your personal data from unauthorized access, loss, misuse, or alteration.
          </p>
          <p>However, no method of transmission over the internet is completely secure.</p>
        </section>

        <section className="policy-section">
          <h2>6. Data Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal data to third parties.
          </p>
          <p>We may share limited information with:</p>
          <ul>
            <li>Service providers who assist in operating our website and services</li>
            <li>Legal or regulatory authorities when required by law</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary to:
          </p>
          <ul>
            <li>Provide our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p>Users may request deletion of their personal data at any time.</p>
        </section>

        <section className="policy-section">
          <h2>8. User Rights</h2>
          <p>
            Under applicable Indian data protection laws, users may:
          </p>
          <ul>
            <li>Request access to their personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of their personal data</li>
          </ul>
          <p>To exercise these rights, please contact us at: <b>support@armabhonline.com</b></p>
          <p>Users may also download reports generated within the platform.</p>
        </section>

        <section className="policy-section">
          <h2>9. Children's Privacy</h2>
          <p>
            Our service may be used by individuals under 18 years of age if they are using the platform for business purposes.
          </p>
          <p>If we become aware that personal information from minors has been collected without appropriate consent, we will take steps to remove such information.</p>
        </section>

        <section className="policy-section">
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
          <p>You are advised to review this Privacy Policy periodically for any changes.</p>
        </section>

        <section className="policy-section">
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <b>support@armabhonline.com</b>
          </p>
        </section>

      </div>
    </div>
  );
};

export default Privacy;
