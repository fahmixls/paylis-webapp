import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getTokenByAddress, shortenAddress } from "~/lib/utils";
import { ExternalLink } from "lucide-react";
import { TransactionStatusBadge } from "~/components/derived/TransactionStatusBadge";
import type { Transaction } from "~/db/schema";

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor("payerAddress", {
    header: "Payer",
    cell: (info) => (
      <div className="truncate max-w-xs md:max-w-none" title={info.getValue()}>
        {shortenAddress(info.getValue())}
      </div>
    ),
  }),
  columnHelper.accessor("recipientAddress", {
    header: "Recipient Address",
    cell: (info) => (
      <div className="truncate max-w-xs md:max-w-none" title={info.getValue()}>
        {shortenAddress(info.getValue())}
      </div>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => {
      const token = getTokenByAddress(info.row.original.tokenAddress);
      const index = token?.decimal || 0;

      const result =
        index !== -1
          ? info.getValue().slice(0, index) + info.getValue().slice(index + 1)
          : info.getValue();
      return <div className="truncate max-w-xs md:max-w-none">{result}</div>;
    },
  }),
  columnHelper.accessor("tokenAddress", {
    header: "Token",
    cell: (info) => {
      const token = getTokenByAddress(info.row.original.tokenAddress);
      return (
        <div className="truncate max-w-xs md:max-w-none">
          {
            <div className="flex items-center gap-1 mb-1 py-1">
              <img src={token?.icon} alt={token?.symbol} className="size-4" />
              <p className="text-medium text-base font-semibold text-wp">
                {token?.symbol}
              </p>
            </div>
          }
        </div>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <TransactionStatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("transactionId", {
    header: "",
    cell: (info) => {
      const id = info.row.original.transactionId;
      return (
        <a
          target="_blank"
          rel="noopener noreferrer"
          title="Detail Transaction"
          href={`/transaction/${id}`}
          className="underline underline-offset-2 text-wp font-semibold hover:text-slate-800"
        >
          <ExternalLink className="size-4" />
          <span className="sr-only">Open Detail</span>
        </a>
      );
    },
  }),
];

export type TransactionTableProps = {
  data: Array<Transaction>;
  next?: number | string;
  previous?: number | string;
  handleNext: (next: number | string) => void;
  handlePrevious: (prev: number | string) => void;
};

export default function TransactionTable(props: TransactionTableProps) {
  const table = useReactTable({
    data: props.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
          <div className="min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 shadow-2xs overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 hidden sm:table-header-group">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          className="px-7 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center gap-x-2">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="block sm:table-row border-b sm:border-none"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="block sm:table-cell px-4 py-3 text-sm text-gray-700"
                        >
                          <div className="sm:hidden font-semibold text-gray-500">
                            {cell.column.columnDef.header as string}
                          </div>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-7 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">
                      {table.getRowModel().rows.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <div className="inline-flex gap-x-2">
                    <button
                      onClick={() =>
                        props.previous
                          ? props.handlePrevious(props.previous)
                          : null
                      }
                      disabled={!props.previous}
                      className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
                    >
                      <svg
                        className="shrink-0 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        props.next ? props.handleNext(props.next) : null
                      }
                      disabled={!props.next}
                      className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
                    >
                      Next
                      <svg
                        className="shrink-0 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
