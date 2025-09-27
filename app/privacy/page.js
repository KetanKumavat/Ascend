"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
                Privacy Policy
            </h1>
            <div className="text-neutral-300 space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        1. Overview
                    </h2>
                    <p>
                        Ascend respects your privacy. This policy explains how
                        we collect, use, and protect your data when you use our
                        project management platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        2. Information We Collect
                    </h2>
                    <p>
                        We collect account information (name, email, profile
                        picture), project data, meeting recordings and
                        transcriptions, usage information, and technical data
                        necessary for service operation.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        3. How We Use Your Data
                    </h2>
                    <p>
                        We use your information to provide our services, enable
                        collaboration, generate meeting transcriptions, send
                        important notifications, ensure security, and comply
                        with legal obligations.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        4. Data Sharing
                    </h2>
                    <p>
                        We share your data with team members for collaboration,
                        service providers who help deliver our services, and
                        when legally required. We do not sell your personal
                        information to advertisers or third parties.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        5. Security & Retention
                    </h2>
                    <p>
                        We implement reasonable security measures to protect
                        your data. We retain information as long as your account
                        is active or as needed for service provision and legal
                        compliance.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        6. Your Rights
                    </h2>
                    <p>
                        Depending on your location, you may have rights to
                        access, correct, delete, restrict processing, or export
                        your data. Contact us to exercise these rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        7. Cookies & Third-Party Services
                    </h2>
                    <p>
                        We use cookies for functionality and analytics. Our
                        platform integrates with third-party services (like
                        Google OAuth). Review their privacy policies for
                        additional information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        8. Children&apos;s Privacy
                    </h2>
                    <p>
                        Our services are not intended for children under 13
                        years of age. We do not knowingly collect information
                        from children.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-neutral-100">
                        9. Changes & Contact
                    </h2>
                    <p>
                        We may update this policy periodically. If you have
                        questions about our privacy practices, please contact us
                        at contact@letsascend.app
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

export default PrivacyPolicy;
