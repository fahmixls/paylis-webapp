import { useState } from "react";
import Footer from "~/components/derived/Footer";
import Step1Form from "./components/step1";
import Step2Review from "./components/step2";
import type { Address } from "viem";

export type FormData = {
  sender: Address | null;
  receiver: Address | null;
  amount: number | null;
  token: {
    address: Address;
    symbol: string;
    icon: string;
    decimal: number;
    minAmount: number;
    flat: number;
  };
};

export default function Payment() {
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<FormData>({
    sender: null,
    receiver: null,
    amount: null,
    token: {
      address: "0x",
      symbol: "",
      icon: "",
      decimal: 18,
      minAmount: 0,
      flat: 0,
    },
  });
  const [step, setStep] = useState<1 | 2>(1);
  const StepIndicator = ({
    step: xStep,
    title,
  }: {
    step: number;
    title: string;
  }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= xStep ? "bg-wp text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {step}
      </div>
      <span
        className={`text-sm ${step >= xStep ? "text-wp" : "text-gray-400"}`}
      >
        {title}
      </span>
    </div>
  );
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <div aria-hidden />
      <div className="h-full mx-auto px-6 py-12 flex flex-col max-w-md justify-center items-center">
        <h1 className="w-full text-center font-extrabold text-2xl text-wp mb-12">
          Instantly Send and Receive Stablecoin Payments
        </h1>
        <div className="flex justify-evenly max-w-sm mx-auto gap-x-7 mb-8">
          <StepIndicator step={1} title="Enter Payment Details" />
          <StepIndicator step={2} title="Review & Confirm" />
        </div>
        <div className="flex h-full justify-center py-12 w-full">
          {step === 1 ? (
            <Step1Form
              setData={(v) => setData(v)}
              setFee={setFee}
              setTotal={setTotal}
              goNext={() => setStep(2)}
              data={data}
            />
          ) : (
            <Step2Review
              formData={data}
              fee={fee}
              total={total}
              goBack={() => setStep(1)}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
