class AnalyticsService {
  async getEventAnalytics(eventId, timeframe = '30d') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const [registrations, payments, results] = await Promise.all([
      Register.find({ 
        eventId, 
        registrationDate: { $gte: startDate, $lte: endDate }
      }),
      Payment.find({ 
        eventId, 
        status: 'SUCCESS',
        paymentDate: { $gte: startDate, $lte: endDate }
      }),
      Result.find({ eventId })
    ]);

    return {
      registrationTrends: this.calculateRegistrationTrends(registrations),
      revenueTrends: this.calculateRevenueTrends(payments),
      demographicAnalysis: await this.calculateDemographicAnalysis(eventId),
      conversionFunnel: this.calculateConversionFunnel(registrations, payments),
      performanceMetrics: this.calculatePerformanceMetrics(registrations, payments, results)
    };
  }

  calculateRegistrationTrends(registrations) {
    const trends = {};
    registrations.forEach(reg => {
      const date = reg.registrationDate.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });
    
    return Object.keys(trends)
      .sort()
      .map(date => ({ date, count: trends[date] }));
  }

  calculateRevenueTrends(payments) {
    const trends = {};
    payments.forEach(payment => {
      const date = payment.paymentDate.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + payment.amount.final;
    });
    
    return Object.keys(trends)
      .sort()
      .map(date => ({ date, revenue: trends[date] }));
  }

  async calculateDemographicAnalysis(eventId) {
    const registrations = await Register.find({ eventId })
      .populate('userId', 'profile.gender profile.dateOfBirth address.city profile.occupation');

    const demographics = {
      gender: {},
      ageGroups: {},
      cities: {},
      occupations: {}
    };

    registrations.forEach(reg => {
      const user = reg.userId;
      
      // Gender analysis
      if (user.profile.gender) {
        demographics.gender[user.profile.gender] = (demographics.gender[user.profile.gender] || 0) + 1;
      }
      
      // Age group analysis
      if (user.profile.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear();
        const ageGroup = age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : age < 55 ? '45-54' : '55+';
        demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1;
      }
      
      // City analysis
      if (user.address.city) {
        demographics.cities[user.address.city] = (demographics.cities[user.address.city] || 0) + 1;
      }
      
      // Occupation analysis
      if (user.profile.occupation) {
        demographics.occupations[user.profile.occupation] = (demographics.occupations[user.profile.occupation] || 0) + 1;
      }
    });

    return demographics;
  }

  calculateConversionFunnel(registrations, payments) {
    const totalRegistrations = registrations.length;
    const confirmedRegistrations = registrations.filter(r => r.registrationStatus === 'CONFIRMED').length;
    const paidRegistrations = payments.length;
    const attendedUsers = registrations.filter(r => r.attendanceStatus === 'ATTENDED').length;

    return {
      stages: [
        { name: 'Registered', count: totalRegistrations, percentage: 100 },
        { name: 'Confirmed', count: confirmedRegistrations, percentage: (confirmedRegistrations / totalRegistrations * 100).toFixed(2) },
        { name: 'Paid', count: paidRegistrations, percentage: (paidRegistrations / totalRegistrations * 100).toFixed(2) },
        { name: 'Attended', count: attendedUsers, percentage: (attendedUsers / totalRegistrations * 100).toFixed(2) }
      ]
    };
  }

  calculatePerformanceMetrics(registrations, payments, results) {
    return {
      registrationRate: registrations.length,
      paymentConversionRate: registrations.length > 0 ? (payments.length / registrations.length * 100).toFixed(2) : 0,
      attendanceRate: registrations.length > 0 ? 
        (registrations.filter(r => r.attendanceStatus === 'ATTENDED').length / registrations.length * 100).toFixed(2) : 0,
      averageRevenuePerRegistration: registrations.length > 0 ? 
        (payments.reduce((sum, p) => sum + p.amount.final, 0) / registrations.length).toFixed(2) : 0,
      completionRate: results.length > 0 ? 
        (results.filter(r => r.tag !== 'PARTICIPANT').length / results.length * 100).toFixed(2) : 0
    };
  }
}

module.exports = AnalyticsService;