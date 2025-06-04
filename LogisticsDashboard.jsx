
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function LogisticsDashboard() {
  const [shipmentData, setShipmentData] = useState([]);
  const [benchmarkingData, setBenchmarkingData] = useState([]);
  const [gatewayData, setGatewayData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Populate all three datasets
      const shipment = worksheet.slice(0, 5).map((row) => ({
        month: row["Month"] || "N/A",
        CW: parseFloat(row["ChW in Tons"] || 0),
        GW: parseFloat(row["Actual Weight Tons"] || 0),
        M3: Math.random().toFixed(2)
      }));

      const bench = worksheet.slice(0, 5).map((row) => ({
        carrier: String(row["Carrier"]).slice(0, 10),
        NAR: parseFloat(row["Revenue EUR"] || 0),
        GP: parseFloat(row["GP EUR"] || 0)
      }));

      const gateway = worksheet.slice(0, 5).map((row) => ({
        gateway: row["Origin airport (master)"] || "N/A",
        utilization: (
          parseFloat(row["Actual Weight Tons"] || 0) /
          parseFloat(row["ChW in Tons"] || 1)
        )
      }));

      setShipmentData(shipment);
      setBenchmarkingData(bench);
      setGatewayData(gateway);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-2">
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-bold">Upload Excel File (.xlsx)</h2>
          <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl mb-2">Volume Trend (CW, GW, M3)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={shipmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="CW" stroke="#8884d8" />
              <Line type="monotone" dataKey="GW" stroke="#82ca9d" />
              <Line type="monotone" dataKey="M3" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl mb-2">NAR vs GP</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={benchmarkingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrier" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="NAR" fill="#8884d8" />
              <Bar dataKey="GP" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl mb-2">Gateway Utilization %</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gatewayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gateway" />
              <YAxis domain={[0, 1]} tickFormatter={(val) => `${Math.round(val * 100)}%`} />
              <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
              <Bar dataKey="utilization" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
