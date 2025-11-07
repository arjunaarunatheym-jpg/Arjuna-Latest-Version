import { useState, useEffect } from "react";
import { axiosInstance } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, FileText, Calendar, LogOut, CheckCircle2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const SupervisorDashboard = ({ user, onLogout }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/supervisor/sessions');
      setSessions(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load sessions");
      setLoading(false);
    }
  };

  const loadAttendance = async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/supervisor/attendance/${sessionId}`);
      setAttendance(response.data);
    } catch (error) {
      toast.error("Failed to load attendance");
    }
  };

  const loadReport = async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/reports/session/${sessionId}`);
      setReport(response.data);
    } catch (error) {
      setReport(null);
      toast.error("No published report available yet");
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    loadAttendance(session.id);
    loadReport(session.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user.full_name}</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">
              <Calendar className="w-4 h-4 mr-2" />
              Training Sessions
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Users className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Training Reports
            </TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>My Training Sessions</CardTitle>
                <CardDescription>Training sessions for your company staff</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-12 text-gray-500">Loading...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No sessions assigned</p>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card 
                        key={session.id} 
                        className={`cursor-pointer border-l-4 ${
                          selectedSession?.id === session.id 
                            ? 'border-l-blue-500 bg-blue-50' 
                            : 'border-l-gray-300'
                        }`}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{session.name}</CardTitle>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                            <div>📍 {session.location}</div>
                            <div>📅 {new Date(session.start_date).toLocaleDateString()}</div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Staff Attendance</CardTitle>
                <CardDescription>
                  {selectedSession ? `Attendance for ${selectedSession.name}` : 'Select a session to view attendance'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedSession ? (
                  <p className="text-center py-12 text-gray-500">Select a session to view attendance</p>
                ) : attendance.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No attendance records yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Participant</th>
                          <th className="px-4 py-2 text-left">Clock In</th>
                          <th className="px-4 py-2 text-left">Clock Out</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2">
                              <div>
                                <p className="font-semibold">{record.participant_name}</p>
                                <p className="text-sm text-gray-600">{record.participant_email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {record.clock_in_time ? new Date(record.clock_in_time).toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-2">
                              {record.clock_out_time ? new Date(record.clock_out_time).toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-2">
                              {record.clock_out_time ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Complete
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                  In Progress
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Training Report</CardTitle>
                <CardDescription>
                  {selectedSession ? `Report for ${selectedSession.name}` : 'Select a session to view report'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedSession ? (
                  <p className="text-center py-12 text-gray-500">Select a session to view report</p>
                ) : !report ? (
                  <p className="text-center py-12 text-gray-500">Report not yet published by coordinator</p>
                ) : (
                  <div className="prose max-w-none">
                    <div className="mb-4 p-4 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        📄 Published on: {new Date(report.published_at).toLocaleString()}
                      </p>
                    </div>
                    <ReactMarkdown>{report.content}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
