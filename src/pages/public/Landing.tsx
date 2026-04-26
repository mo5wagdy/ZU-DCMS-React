import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, RotateCw, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRTL } from "@/hooks/useRTL";

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const isRTL = useRTL();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const handleBook = (type: "new" | "followup") => {
    const target = type === "new" ? "/booking/new" : "/booking/followup";
    if (isAuthenticated && role === "Patient") {
      navigate(target);
    } else {
      navigate(`/auth/login?redirect=${encodeURIComponent(target)}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* decorative background */}
      <div className="absolute inset-0 -z-10 bg-gradient-soft" />
      <div className="absolute -top-40 -end-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute -bottom-40 -start-40 -z-10 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />

      <section className="container py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("landing.trustBadge")}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground mb-4">
            {t("landing.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            <span className="font-bold text-foreground">{t("landing.welcome")}</span>
            {" — "}
            {t("landing.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              onClick={() => handleBook("new")}
              className="card-hover cursor-pointer p-8 group border-2 hover:border-primary/40 bg-card relative overflow-hidden"
            >
              <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-card mb-5">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {t("landing.bookNew")}
                </h3>
                <p className="text-muted-foreground mb-5">{t("landing.bookNewDesc")}</p>
                <div className="inline-flex items-center gap-2 text-primary font-semibold">
                  {t("booking.new")}
                  <Arrow className="h-4 w-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              onClick={() => handleBook("followup")}
              className="card-hover cursor-pointer p-8 group border-2 hover:border-accent/40 bg-card relative overflow-hidden"
            >
              <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors" />
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-gold text-accent-foreground shadow-card mb-5">
                  <RotateCw className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {t("landing.followUp")}
                </h3>
                <p className="text-muted-foreground mb-5">{t("landing.followUpDesc")}</p>
                <div className="inline-flex items-center gap-2 text-accent font-semibold">
                  {t("landing.followUp")}
                  <Arrow className="h-4 w-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <Button asChild variant="ghost">
            <Link to="/auth/login">{t("landing.login")}</Link>
          </Button>
          <span className="text-muted-foreground/50">·</span>
          <Button asChild variant="ghost">
            <Link to="/auth/register">{t("landing.register")}</Link>
          </Button>
          <span className="text-muted-foreground/50">·</span>
          <Link
            to="/auth/staff-login"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t("landing.staffLogin")}
          </Link>
        </div>
      </section>
    </div>
  );
}
