"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TermsAndConditions = () => {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl mt-16">
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </div>

            <h1 className="text-4xl font-bold mb-6 text-neutral-100">
                Terms and Conditions
            </h1>
            <div className="text-neutral-300 space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        1. Agreement to Terms
                    </h2>
                    <p>
                        By accessing or using Ascend&apos;s project management
                        platform, you agree to these Terms. If you disagree with
                        any part, you may not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        2. Account & Content
                    </h2>
                    <p>
                        You must provide accurate information when creating an
                        account and are responsible for all activity under it.
                        You retain ownership of your content but grant us
                        license to use it to provide our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        3. Meeting Recordings
                    </h2>
                    <p>
                        When using our meeting features, you acknowledge
                        meetings may be recorded and transcribed. You must
                        inform participants and obtain necessary consents as
                        required by law.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        4. Acceptable Use
                    </h2>
                    <p>
                        You may not use our service to violate laws, transmit
                        harmful code, impersonate others, harass others, or
                        interfere with the service&apos;s operation. We reserve
                        the right to terminate accounts that violate these
                        terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        5. Intellectual Property
                    </h2>
                    <p>
                        Ascend and its content (excluding your content) remain
                        our exclusive property, protected by copyright and
                        trademark laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        6. Third-Party Services
                    </h2>
                    <p>
                        We integrate with third-party services like Google
                        OAuth. Your use of these services is subject to their
                        respective terms and privacy policies.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        7. Disclaimer & Liability
                    </h2>
                    <p>
                        Our service is provided &quot;as is&quot; without
                        warranties. To the extent permitted by law, we are not
                        liable for damages arising from your use of our service.
                        You are responsible for backing up your content.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        8. Changes & Termination
                    </h2>
                    <p>
                        We may modify these terms or discontinue the service at
                        any time. We may terminate your access for violations of
                        these terms or any other reason at our discretion.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        9. Governing Law
                    </h2>
                    <p>
                        These Terms are governed by applicable laws without
                        regard to conflict of law principles.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        10. Contact
                    </h2>
                    <p>
                        For questions about these Terms, contact us at:
                        ketan.kumavat1984@gmail.com
                    </p>
                </section>

                <div className="border-t border-neutral-800 pt-4 mt-8">
                    <p className="text-neutral-400">
                        Last Updated: September 22, 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
