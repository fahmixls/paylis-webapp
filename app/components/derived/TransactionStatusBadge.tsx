import { TransactionStatus } from "@openzeppelin/relayer-sdk";
import React from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface Props {
  status: TransactionStatus | string;
}

const getStatusLabel = (status: TransactionStatus | string): string => {
  switch (status) {
    case TransactionStatus.CONFIRMED:
    case TransactionStatus.MINED:
      return "Success";
    case TransactionStatus.SUBMITTED:
    case TransactionStatus.SENT:
    case TransactionStatus.PENDING:
      return "Pending";
    case TransactionStatus.CANCELED:
    case TransactionStatus.EXPIRED:
      return "Cancelled";
    case TransactionStatus.FAILED:
      return "Failed";
    default:
      return "Unknown";
  }
};

const getStatusColor = (status: TransactionStatus | string): string => {
  switch (status) {
    case TransactionStatus.CONFIRMED:
    case TransactionStatus.MINED:
      return "bg-green-500 text-white";
    case TransactionStatus.FAILED:
      return "bg-red-500 text-white";
    case TransactionStatus.CANCELED:
    case TransactionStatus.EXPIRED:
      return "bg-gray-500 text-white";
    case TransactionStatus.PENDING:
    case TransactionStatus.SENT:
    case TransactionStatus.SUBMITTED:
      return "bg-yellow-500 text-white";
    default:
      return "bg-muted text-wp";
  }
};

export const TransactionStatusBadge: React.FC<Props> = ({ status }) => {
  return (
    <Badge variant="secondary" className={cn(getStatusColor(status))}>
      {getStatusLabel(status)}
    </Badge>
  );
};
