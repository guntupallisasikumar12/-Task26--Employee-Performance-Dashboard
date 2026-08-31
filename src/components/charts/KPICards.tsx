import type { Kpis } from '../../types';

interface KPICardsProps {
    kpis: Kpis | null;
    isLoading: boolean;
}

function KPICards({ kpis, isLoading }: KPICardsProps) {
    if (isLoading || !kpis) {
        return (
            <div className="kpi-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div className="kpi-card kpi-card--skeleton" key={i} />
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total Employees', value: kpis.total_employees },
        { label: 'Total Reviews', value: kpis.total_reviews },
        { label: 'Average Rating Score', value: kpis.avg_score.toFixed(2) },
        { label: 'Top Performer', value: kpis.top_performer ?? '—' },
    ];

    return (
        <div className="kpi-grid">
            {cards.map((card) => (
                <div className="kpi-card" key={card.label}>
                    <span className="kpi-card__value">{card.value}</span>
                    <span className="kpi-card__label">{card.label}</span>
                </div>
            ))}
        </div>
    );
}

export default KPICards;