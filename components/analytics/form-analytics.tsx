"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { BarChart3, Users, Eye, TrendingUp, Clock, MapPin, Smartphone, Monitor, Tablet } from "lucide-react"

interface FormAnalyticsProps {
  projectId: string
  analytics: any
}

export function FormAnalytics({ projectId, analytics }: FormAnalyticsProps) {
  const mockData = {
    totalViews: 12847,
    totalSubmissions: 3421,
    conversionRate: 26.6,
    averageTime: "2m 34s",
    topCountries: [
      { country: "United States", percentage: 45.2, flag: "🇺🇸" },
      { country: "United Kingdom", percentage: 18.7, flag: "🇬🇧" },
      { country: "Canada", percentage: 12.3, flag: "🇨🇦" },
      { country: "Germany", percentage: 8.9, flag: "🇩🇪" },
      { country: "France", percentage: 6.1, flag: "🇫🇷" },
    ],
    deviceBreakdown: [
      { device: "Desktop", percentage: 52.3, icon: <Monitor className="w-4 h-4" /> },
      { device: "Mobile", percentage: 38.7, icon: <Smartphone className="w-4 h-4" /> },
      { device: "Tablet", percentage: 9.0, icon: <Tablet className="w-4 h-4" /> },
    ],
    weeklyData: [
      { day: "Mon", views: 1840, submissions: 487 },
      { day: "Tue", views: 2156, submissions: 623 },
      { day: "Wed", views: 1923, submissions: 534 },
      { day: "Thu", views: 2087, submissions: 612 },
      { day: "Fri", views: 1756, submissions: 445 },
      { day: "Sat", views: 1432, submissions: 356 },
      { day: "Sun", views: 1653, submissions: 364 },
    ],
  }

  const stats = [
    {
      title: "Total Views",
      value: mockData.totalViews.toLocaleString(),
      change: "+12.5%",
      icon: <Eye className="w-5 h-5" />,
      color: "blue",
    },
    {
      title: "Submissions",
      value: mockData.totalSubmissions.toLocaleString(),
      change: "+8.2%",
      icon: <Users className="w-5 h-5" />,
      color: "green",
    },
    {
      title: "Conversion Rate",
      value: `${mockData.conversionRate}%`,
      change: "+2.1%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple",
    },
    {
      title: "Avg. Time",
      value: mockData.averageTime,
      change: "-15s",
      icon: <Clock className="w-5 h-5" />,
      color: "orange",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Analytics</h2>
        <p className="text-gray-600">Real-time insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-lg ${
                      stat.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : stat.color === "green"
                          ? "bg-green-100 text-green-600"
                          : stat.color === "purple"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {stat.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.topCountries.map((country, index) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${country.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{country.percentage}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.deviceBreakdown.map((device, index) => (
                <motion.div
                  key={device.device}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600">{device.icon}</div>
                    <span className="text-sm font-medium">{device.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{device.percentage}%</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {mockData.weeklyData.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex flex-col gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.views / 2500) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    className="bg-blue-500 rounded-t min-h-[20px] max-h-32"
                    title={`Views: ${day.views}`}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.submissions / 700) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                    className="bg-green-500 rounded-t min-h-[10px] max-h-20"
                    title={`Submissions: ${day.submissions}`}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">{day.day}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-xs text-gray-600">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-gray-600">Submissions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
