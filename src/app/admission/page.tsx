"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, ChevronRight, ChevronLeft, Download, Loader2, Upload } from "lucide-react";
import jsPDF from "jspdf";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

const steps = [
    { id: 1, title: "Personal Details" },
    { id: 2, title: "Contact Info" },
    { id: 3, title: "Course Selection" },
];

export default function AdmissionPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        fatherName: "",
        cnic: "",
        phone: "",
        address: "",
        course: "",
        dob: "",
        religion: "",
        nationality: "Pakistani",
        qualification: "",
        email: "",
        gender: "Male",
        admissionFee: "",
        monthlyFee: "",
        image_url: "",
        parentalAlerts: { email: false, sms: true }
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses");
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    const formattedCourses = data.data.map((c: any) => ({
                        value: c.title,
                        label: c.title
                    }));
                    setCourses(formattedCourses);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    const handleAlertChange = (type: 'email' | 'sms') => {
        setFormData(prev => ({
            ...prev,
            parentalAlerts: { ...prev.parentalAlerts, [type]: !prev.parentalAlerts[type] }
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const generatePDF = async (data?: any) => {
        // Use passed data if available (and it's not an event object), otherwise fall back to state
        const form = (data && data.name !== undefined) ? data : formData;
        try {
            const doc = new jsPDF(); // Default is A4

            // Helper to load image
            const loadImage = (src: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous"; // Crucial for external/local images
                    img.src = src;
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                });
            };

            let logo: HTMLImageElement | null = null;
            try {
                logo = await loadImage("/logo-new.png");
            } catch (e) {
                console.warn("Logo failed to load", e);
            }

            // --- DUAL COPY LAYOUT ---
            // A4 Height = ~297mm. Half = ~148mm.
            // We will draw two identical forms: Top (Office Copy) & Bottom (Student Copy).

            const drawAdmitForm = (startY: number, copyType: "OFFICE COPY" | "STUDENT COPY") => {
                // Outer Border for this half
                doc.setLineWidth(0.5);
                doc.setDrawColor(0);
                doc.rect(5, startY, 200, 140); // 140mm height per copy

                // --- HEADER ---
                // Logo (Smaller for half-page)
                if (logo) {
                    doc.addImage(logo, "PNG", 10, startY + 5, 20, 20);
                }

                // Student Photo
                if (studentPhoto) {
                    doc.addImage(studentPhoto, "JPEG", 175, startY + 45, 25, 30);
                }

                // Institute Name
                doc.setFont("helvetica", "bold");
                doc.setFontSize(24); // Slightly larger
                doc.text("ALFUNUN ACADEMY", 105, startY + 14, { align: "center" });

                // Tagline Box (Enhanced)
                doc.setDrawColor(0);
                doc.setFillColor(0);
                // Larger box, centered
                doc.roundedRect(75, startY + 18, 60, 6, 1, 1, "F");

                doc.setTextColor(255);
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text("LEARN HERE EARN ANYWHERE", 105, startY + 22, { align: "center" });
                doc.setTextColor(0);

                // Copy Type Label (Top Right)
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(copyType, 195, startY + 8, { align: "right" });
                doc.setTextColor(0);

                // Separator
                doc.setLineWidth(0.5);
                doc.line(10, startY + 28, 200, startY + 28);

                // Contact Info (Two Lines)
                doc.setFont("helvetica", "bold");

                // Line 1: Phone & Web
                doc.setFontSize(9);
                doc.text("0315-2111190  |  WWW.ALFUNUNACADEMY.COM", 105, startY + 33, { align: "center" });

                // Line 2: Address (Long)
                doc.setFontSize(7);
                doc.text("Alfunun Academy, Musharaf Colony, Hawksbay Road, Plot No-286 Sector 6A,", 105, startY + 37, { align: "center" });
                doc.text("Near TCF School Jeddy and Zia-Ud-din Campus", 105, startY + 40, { align: "center" });

                // --- FORM BODY ---
                const formTop = startY + 45; // Pushed down for address space

                // Photo Box (Right)
                doc.setDrawColor(0);
                doc.rect(175, formTop, 25, 30);
                // Draw text only if no photo is present (to avoid overlay)
                if (!studentPhoto) {
                    doc.setFontSize(8);
                    doc.text("Photo", 187.5, formTop + 15, { align: "center" });
                }

                // Admission Title (Left)
                doc.setFillColor(0);
                doc.roundedRect(10, formTop, 50, 8, 1, 1, "F");
                doc.setTextColor(255);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ADMISSION FORM", 35, formTop + 5, { align: "center" });
                doc.setTextColor(0);

                // Student ID & Date
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text("ID: ________", 70, formTop + 6);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 110, formTop + 6);

                // Fields (Compact)
                let y = formTop + 15;
                const leftX = 10;
                const rightX = 105;

                const drawLineField = (label: string, value: string, x: number, w: number) => {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.text(label, x, y);
                    doc.setFont("helvetica", "normal");
                    doc.text(value || "", x + doc.getTextWidth(label) + 2, y);
                    doc.line(x, y + 1, x + w, y + 1); // Underline
                };

                // Row 1: Name & Father Name
                drawLineField("Name:", form.name, leftX, 85);
                drawLineField("Father Name:", form.fatherName, rightX, 60); // Shortened to avoid photo
                y += 8;

                // Row 2: CNIC & Phone
                drawLineField("CNIC:", form.cnic, leftX, 85);
                drawLineField("Phone:", form.phone, rightX, 60);
                y += 8;

                // Row 3: Address (Full Width)
                drawLineField("Address:", form.address, leftX, 155); // Avoid photo
                y += 8;

                // Row 4: Course Selection
                y += 4;
                doc.setFont("helvetica", "bold");
                doc.text("Selected Course:", leftX, y);
                doc.setFillColor(220); // Light gray highlight
                doc.rect(35, y - 4, 130, 6, "F");
                doc.setFont("helvetica", "bold");
                doc.text(form.course || "N/A", 38, y);

                // Row 5: Fee Info (Empty for office to fill)
                y += 10;
                doc.rect(leftX, y, 190, 12);
                doc.line(leftX + 63, y, leftX + 63, y + 12);
                doc.line(leftX + 126, y, leftX + 126, y + 12);

                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");

                const admFee = form.admissionFee ? `${form.admissionFee} /-` : "________";
                const mthFee = form.monthlyFee ? `${form.monthlyFee} /-` : "________";
                const total = (Number(form.admissionFee || 0) + Number(form.monthlyFee || 0));
                const totalText = total > 0 ? `${total} /-` : "________";

                doc.text(`Admission Fee:  ${admFee}`, leftX + 2, y + 8);
                doc.text(`Monthly Fee:  ${mthFee}`, leftX + 66, y + 8);
                doc.text(`Total Received:  ${totalText}`, leftX + 129, y + 8);

                // Signatures
                const sigY = startY + 125;
                doc.line(15, sigY, 60, sigY);
                doc.text("Student Sig", 37.5, sigY + 4, { align: "center" });

                doc.line(80, sigY, 125, sigY);
                doc.text("Admin Sig", 102.5, sigY + 4, { align: "center" });

                doc.line(145, sigY, 190, sigY);
                doc.text("Parent Sig", 167.5, sigY + 4, { align: "center" });
            };

            let studentPhoto: HTMLImageElement | null = null;
            if (form.image_url) {
                try {
                    studentPhoto = await loadImage(form.image_url);
                } catch (e) {
                    console.warn("Student photo failed to load for PDF", e);
                }
            }

            // 1. Draw Office Copy (Top)
            drawAdmitForm(5, "OFFICE COPY");

            // 2. Cut Line
            doc.setLineWidth(0.5);
            doc.setLineDashPattern([3, 3], 0); // Dashed line
            doc.line(0, 148.5, 210, 148.5);
            doc.setLineDashPattern([], 0); // Reset solid

            // 3. Draw Student Copy (Bottom)
            drawAdmitForm(153.5, "STUDENT COPY");

            // Generate Filename
            const cleanName = (form.name || "Student").replace(/[^a-zA-Z0-9]/g, "_");
            const filename = `Alfunun_Admission_Form_${cleanName}.pdf`;

            // Manual Blob Download to ensure correct MIME type and filename
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("PDF generation failed:", error);
            showToast("Failed to generate PDF. Please try again.", "error");
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let finalImageUrl = "";

            // Upload Photo First
            if (photoFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", photoFile);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success && uploadData.url) {
                    finalImageUrl = uploadData.url;
                }
            }

            // Update form data with image URL for database
            const finalData = { ...formData, image_url: finalImageUrl };
            // Update state so PDF generation sees it
            setFormData(finalData);

            // Wait a tick for state update? No, we pass finalData to API.
            // But for generatePDF relying on state 'formData', we might have a race condition if we call it immediately after setFormData.
            // Actually generatePDF reads from 'formData' state which won't be updated in this closure.
            // We need to pass data to generatePDF or rely on a "saved" state.
            // Easier fix: Let's defer PDF generation or save the url in a ref?
            // Or simpler: We just successfully saved to DB.
            // The generatePDF function reads from 'formData' state variable.
            // We can update the state, but inside this function 'formData' is stale.
            // Let's modify generatePDF to accept data optionally?
            // Or just update the state and rely on the re-render success screen where user clicks PDF download?
            // Ah, the user clicks "Download Form Again".
            // But we also call generatePDF() automatically on success.

            // Workaround: We will rely on the fact that we can reload the PDF generator with new data?
            // Let's just update the state. The automatic generatePDF might miss the image if we don't pass it.
            // Let's temporarily update formData state here.

            const res = await fetch("/api/admission", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
            });

            if (res.ok) {
                // Ensure state is updated for the "Download Again" button
                setFormData(prev => ({ ...prev, image_url: finalImageUrl }));

                // For the automatic validation, we should ideally wait or pass the data.
                // But since we set IsSuccess(true), the UI changes.
                // Let's handle PDF generation there or let the user click download.
                // We'll call generatePDF after a small timeout to allow state to settle or just pass the explicit image url to a modified generatePDF?
                // For now, let's just rely on the user clicking download if the auto one misses it, chances are strict mode might cause issues.
                // Actually, let's just wait for the user to download it from the success screen essentially.
                // But I'll leave generatePDF() call here. It might use the old state (empty image_url).
                // To fix: I'll use a local variable for generation if possible, but generatePDF uses scoped formData.
                // I will NOT refactor generatePDF just yet to accept args to avoid huge diff.
                // I will assume the auto-download might lack the image, but the manual one won't.

                setIsSuccess(true);
                // Call generatePDF with the final data immediately
                await generatePDF(finalData);
                showToast("Admission application submitted successfully!", "success");
            } else {
                showToast("Something went wrong. Please try again.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("An error occurred. Please check your connection.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-md text-center p-8 border-cyan-500/30 bg-zinc-900/80">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                    <p className="text-zinc-400 mb-8">
                        Your admission form has been generated. Please download it and visit the campus.
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                        <Button onClick={() => generatePDF()} variant="glow" className="w-full">
                            <Download className="mr-2 w-4 h-4" /> Download Form Again
                        </Button>
                        <Button onClick={() => router.push('/')} variant="ghost" className="w-full text-zinc-400 hover:text-white hover:bg-white/5">
                            Return to Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-20 container px-4 md:px-6 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${currentStep >= step.id
                                        ? "bg-cyan-500 border-cyan-500 text-white"
                                        : "bg-zinc-900 border-zinc-700 text-zinc-500"
                                        }`}
                                >
                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? "text-cyan-400" : "text-zinc-600"}`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                        {/* Progress Bar Line */}
                        <div className="absolute top-10 left-0 w-full h-0.5 bg-zinc-800 -z-0 hidden md:block" />
                    </div>
                </div>

                <Card className="border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription>Please fill in the details correctly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {currentStep === 1 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Full Name</label>
                                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ali Khan" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Father's Name</label>
                                                <Input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="e.g. Ahmed Khan" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Date of Birth</label>
                                                <Input name="dob" type="date" value={formData.dob} onChange={handleChange} className="bg-zinc-950/50" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Gender</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full h-10 rounded-md border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">CNIC / B-Form</label>
                                                <Input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="00000-0000000-0" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Nationality</label>
                                                <Input name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. Pakistani" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="text-sm font-medium text-zinc-300 mb-1 block">Passport Size Photo</label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-full">
                                                    <div className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400 items-center transition-colors hover:bg-zinc-900/70 hover:border-cyan-500/30">
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        <span className="truncate">{photoFile ? photoFile.name : "Upload Photo"}</span>
                                                    </div>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                </div>
                                                {photoFile && (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative shrink-0">
                                                        <img src={URL.createObjectURL(photoFile)} className="object-cover w-full h-full" alt="Preview" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {currentStep === 2 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Phone Number</label>
                                                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0300-0000000" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Email</label>
                                                <Input name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-zinc-300 mb-1 block">Address</label>
                                            <Input name="address" value={formData.address} onChange={handleChange} placeholder="House #, Street, City" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Qualification</label>
                                                <Input name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. Matric / Intermediate" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Religion</label>
                                                <Input name="religion" value={formData.religion} onChange={handleChange} placeholder="e.g. Islam" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {currentStep === 3 && (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-zinc-300 mb-1 block">Select Course</label>
                                            <CustomSelect
                                                value={formData.course}
                                                onChange={(value) => setFormData({ ...formData, course: value })}
                                                options={courses.length > 0 ? courses : [
                                                    { value: "Web Designing", label: "Web Designing" },
                                                    { value: "Graphic Designing", label: "Graphic Designing" },
                                                    { value: "Office Automation", label: "Office Automation" },
                                                    { value: "Basic Computer Skills", label: "Basic Computer Skills" },
                                                    { value: "Digital Marketing", label: "Digital Marketing" },
                                                ]}
                                                placeholder="Select a course..."
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Admission Fee (Paid)</label>
                                                <Input
                                                    name="admissionFee"
                                                    type="number"
                                                    value={formData.admissionFee}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 1000"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-zinc-300 mb-1 block">Monthly Fee (Paid)</label>
                                                <Input
                                                    name="monthlyFee"
                                                    type="number"
                                                    value={formData.monthlyFee}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 2000"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            type="button"
                            className="text-zinc-400 hover:text-white"
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" /> Previous
                        </Button>

                        {currentStep < steps.length ? (
                            <Button onClick={nextStep} type="button" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                                Next <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isLoading} variant="glow">
                                {isLoading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : "Submit Application"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
