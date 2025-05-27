
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatsGrid = () => {
  const stats = [
    { label: "Props Analyzed", value: "10,000+", suffix: "" },
    { label: "Success Rate", value: "78", suffix: "%" },
    { label: "Active Users", value: "2,500+", suffix: "" },
    { label: "Data Points", value: "1M+", suffix: "" },
  ];

  return (
    <section className="py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-slate-800">
                {stat.value}
                <span className="text-blue-600">{stat.suffix}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
