
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow,
  Wind,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  date: Date;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'avoid';
  priceMultiplier: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  recommendation: string;
  weatherImpact: string;
}

export function WeatherScheduling() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Mock weather data for next 7 days
  useEffect(() => {
    const generateWeatherData = () => {
      const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy'];
      const recommendations: WeatherData['recommendation'][] = ['excellent', 'good', 'fair', 'poor'];
      
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const condition = i === 0 ? 'sunny' : i === 2 ? 'rainy' : conditions[i % 3];
        const precipitation = condition === 'rainy' ? 80 : condition === 'stormy' ? 90 : i * 10;
        
        const recommendation: WeatherData['recommendation'] = 
          precipitation > 60 ? 'poor' : precipitation > 30 ? 'fair' : 'excellent';
        
        return {
          date,
          condition,
          temperature: 20 + i * 2,
          precipitation,
          windSpeed: 10 + i * 5,
          uvIndex: condition === 'sunny' ? 8 : condition === 'cloudy' ? 4 : 2,
          recommendation,
          priceMultiplier: precipitation > 60 ? 0.8 : precipitation > 30 ? 0.9 : condition === 'sunny' ? 1.1 : 1.0
        };
      });
    };

    setWeatherData(generateWeatherData());
  }, []);

  // Generate time slots based on selected date
  useEffect(() => {
    if (!selectedDate) return;

    const selectedWeather = weatherData.find(
      w => w.date.toDateString() === selectedDate.toDateString()
    );

    if (!selectedWeather) return;

    const slots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ].map(time => {
      const basePrice = 150;
      const adjustedPrice = Math.round(basePrice * selectedWeather.priceMultiplier);
      
      return {
        time,
        available: selectedWeather.recommendation !== 'avoid',
        price: adjustedPrice,
        recommendation: selectedWeather.recommendation,
        weatherImpact: selectedWeather.condition === 'rainy' 
          ? 'May experience delays due to rain'
          : selectedWeather.condition === 'sunny'
          ? 'Perfect weather for car wash!'
          : 'Good conditions with minimal weather impact'
      };
    });

    setTimeSlots(slots);
  }, [selectedDate, weatherData]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'stormy': return <CloudRain className="w-5 h-5 text-purple-500" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'avoid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceColor = (multiplier: number) => {
    if (multiplier > 1) return 'text-red-600';
    if (multiplier < 1) return 'text-green-600';
    return 'text-gray-900';
  };

  const selectedWeather = weatherData.find(
    w => w.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Smart Weather Scheduling</h3>
              <p className="text-sm text-gray-600">AI-powered scheduling based on weather conditions</p>
            </div>
            <Badge className="bg-cyan-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              SMART AI
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 p-4">
              {weatherData.map((weather, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(weather.date)}
                  className={`
                    p-2 text-center rounded transition-all
                    ${selectedDate.toDateString() === weather.date.toDateString()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  <div className="text-xs">
                    {weather.date.toLocaleDateString('en-US', { 
                      weekday: 'short' 
                    })}
                  </div>
                  <div className="font-medium">
                    {weather.date.getDate()}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Overview */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.map((weather, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer
                    ${selectedDate.toDateString() === weather.date.toDateString() 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setSelectedDate(weather.date)}
                >
                  <div className="flex items-center space-x-3">
                    {getWeatherIcon(weather.condition)}
                    <div>
                      <div className="font-medium">
                        {weather.date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {weather.condition} · {weather.temperature}°C
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getRecommendationColor(weather.recommendation)}>
                      {weather.recommendation}
                    </Badge>
                    <div className={`text-sm font-medium ${getPriceColor(weather.priceMultiplier)}`}>
                      {weather.priceMultiplier > 1 ? (
                        <span className="flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{Math.round((weather.priceMultiplier - 1) * 100)}%
                        </span>
                      ) : weather.priceMultiplier < 1 ? (
                        <span className="flex items-center">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          -{Math.round((1 - weather.priceMultiplier) * 100)}%
                        </span>
                      ) : (
                        'Standard'
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      {selectedWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <Badge className={getRecommendationColor(selectedWeather.recommendation)}>
                {selectedWeather.recommendation} day for car wash
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Weather Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(selectedWeather.condition)}
                </div>
                <div className="font-medium capitalize">{selectedWeather.condition}</div>
                <div className="text-sm text-gray-600">{selectedWeather.temperature}°C</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="flex justify-center mb-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                </div>
                <div className="font-medium">Rain Chance</div>
                <div className="text-sm text-gray-600">{selectedWeather.precipitation}%</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="flex justify-center mb-2">
                  <Wind className="w-5 h-5 text-gray-500" />
                </div>
                <div className="font-medium">Wind</div>
                <div className="text-sm text-gray-600">{selectedWeather.windSpeed} km/h</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="flex justify-center mb-2">
                  <Sun className="w-5 h-5 text-orange-500" />
                </div>
                <div className="font-medium">UV Index</div>
                <div className="text-sm text-gray-600">{selectedWeather.uvIndex}/10</div>
              </div>
            </div>

            {/* Weather Impact Alert */}
            {selectedWeather.recommendation === 'poor' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                  <div>
                    <h4 className="font-medium text-orange-800">Weather Advisory</h4>
                    <p className="text-sm text-orange-700">
                      High chance of rain may cause delays. Consider rescheduling for better weather.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedWeather.recommendation === 'excellent' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <h4 className="font-medium text-green-800">Perfect Weather!</h4>
                    <p className="text-sm text-green-700">
                      Ideal conditions for car washing with great results expected.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Available Time Slots */}
            <div>
              <h4 className="font-medium mb-4">Available Time Slots</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {timeSlots.map((slot) => (
                  <motion.div
                    key={slot.time}
                    whileHover={{ scale: slot.available ? 1.02 : 1 }}
                    className={`
                      relative p-3 rounded-lg border cursor-pointer transition-all
                      ${slot.available 
                        ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="font-medium text-center">{slot.time}</div>
                    <div className={`text-sm text-center font-medium ${getPriceColor(selectedWeather.priceMultiplier)}`}>
                      R{slot.price}
                    </div>
                    {selectedWeather.priceMultiplier !== 1 && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="text-xs px-1 py-0">
                          {selectedWeather.priceMultiplier > 1 ? '📈' : '📉'}
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                All times are approximate and may be adjusted based on weather conditions.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
