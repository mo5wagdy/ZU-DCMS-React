const fs = require('fs');
const enPath = 'src/i18n/en.json';
const arPath = 'src/i18n/ar.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

en.booking.sessionEnded = 'Sorry, the time for this appointment has passed. Please go back to the first step and choose another appointment.';
ar.booking.sessionEnded = 'عذراً، لقد انتهى وقت هذا الميعاد حالياً. يرجى العودة للخطوة الأولى واختيار ميعاد آخر.';

en.booking.activeBookingTitle = 'Alert: Active Booking Exists';
ar.booking.activeBookingTitle = 'تنبيه: يوجد حجز نشط';

en.booking.activeBookingDesc = 'You cannot book a new appointment currently because you have a pending booking or are receiving treatment in another clinic. Please complete or cancel your current booking first.';
ar.booking.activeBookingDesc = 'لا يمكنك حجز موعد جديد حالياً لأن لديك حجز قيد الانتظار أو أنت قيد العلاج في عيادة أخرى. يرجى إتمام حجزك الحالي أو إلغائه أولاً.';

en.booking.activeCaseTitle = 'Alert: Follow-up Case Exists';
ar.booking.activeCaseTitle = 'تنبيه: لديك حالة متابعة';

en.booking.activeCaseDesc = 'You already have an ongoing treatment case. Please use the "Book Follow-up" option instead of booking a new appointment to continue your treatment.';
ar.booking.activeCaseDesc = 'لديك حالة علاجية قائمة بالفعل. يرجى استخدام خيار "حجز متابعة" بدلاً من حجز موعد جديد لتكملة علاجك.';

en.booking.noActiveCaseTitle = 'Alert: No Follow-up Cases';
ar.booking.noActiveCaseTitle = 'تنبيه: لا توجد حالات متابعة';

en.booking.noActiveCaseDesc = 'You do not have any ongoing treatment cases that require follow-up. Please book a new appointment for examination.';
ar.booking.noActiveCaseDesc = 'ليس لديك حالات علاجية قائمة حالياً تتطلب متابعة. يرجى حجز موعد جديد للفحص.';

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
console.log('BookFlow translations added.');
