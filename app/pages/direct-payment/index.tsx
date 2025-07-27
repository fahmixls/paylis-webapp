import { ArrowRight, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDisconnect } from "wagmi";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import Footer from "~/components/derived/Footer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import { MockToken } from "~/mocks/token";

export default function DirectPayment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    sender_address: "",
    recipient_address: "",
    token_address: "",
    amount: 0,
  });
  const [apiData, setApiData] = useState<any>(null);
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);

  const { isConnected } = useWalletLifecycle({
    onConnect(address) {
      setFormData({
        ...formData,
        sender_address: address,
      });
    },
    onDisconnect() {
      setFormData({
        ...formData,
        sender_address: "",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setApiData(data);
      setFee(data.fee || 0);
      setTotal(parseFloat(data.total || 0));
      navigate("/step2");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (apiData) {
      setCurrentStep(2);
    }
  }, [apiData]);

  const { disconnect } = useDisconnect();

  const StepIndicator = ({ step, title }: { step: number; title: string }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
          currentStep >= step ? "bg-wp text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {step}
      </div>
      <span
        className={`text-sm ${
          currentStep >= step ? "text-wp" : "text-gray-400"
        }`}
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
          {currentStep === 1 && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 w-full text-center max-w-2xs"
            >
              <div className="grid w-full gap-3">
                {isConnected ? (
                  <button
                    onClick={() => disconnect()}
                    className="inline-flex justify-center items-center w-full max-w-xs gap-2 rounded-md px-8 py-3 text-base font-semibold border transition-all duration-200 ease-in-out
               border-wp text-wp hover:bg-wp/10 hover:shadow-md hover:scale-[1.01]
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Switch Wallet
                  </button>
                ) : (
                  <ConnectButtonCustom />
                )}
                <br />
                <Label htmlFor="sender_address">Your Address</Label>
                <Input
                  id="sender_address"
                  type="text"
                  name="sender_address"
                  value={formData.sender_address}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="recipient_address">Recipient Address</Label>
                <Input
                  id="recipient_address"
                  type="text"
                  name="recipient_address"
                  value={formData.recipient_address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="token_address">Select Stablecoin</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      id="token_address"
                      placeholder="Select stablecoin"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Stabelcoin</SelectLabel>
                      {MockToken.map((x) => {
                        return (
                          <SelectItem value={x.address}>
                            <img
                              className="rounded-full size-5 -p-2 outline-1"
                              alt={x.symbol}
                              title={x.name}
                              src={x.icon}
                            />
                            <span>{x.symbol}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out"
              >
                Review Payment
                <ArrowRight />
              </button>
            </form>
          )}
          {currentStep === 2 && (
            <div className="space-y-6 w-full text-center max-w-2xs">
              <div className="grid w-full gap-3">
                <Label>Sender Address</Label>
                <Input value={formData.sender_address} disabled />
              </div>
              <div className="grid w-full gap-3">
                <Label>Recipient Address</Label>
                <Input value={formData.recipient_address} disabled />
              </div>
              <div className="grid w-full gap-3">
                <Label>Stablecoin</Label>
                <Input value={formData.token_address} disabled />
              </div>
              <div className="grid w-full gap-3">
                <Label>Amount</Label>
                <Input value={formData.amount} disabled />
              </div>
              <div className="grid w-full gap-3">
                <Label>Fees</Label>
                <Input value={fee} disabled />
              </div>
              <div className="grid w-full gap-3">
                <Label>Total Amount</Label>
                <Input value={total} disabled />
              </div>
              <button
                type="button"
                className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out"
              >
                Process Payment
                <ArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
