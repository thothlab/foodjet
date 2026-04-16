import { useAppStore } from '../store/app-store';

const DAY_NAMES = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export function StoreClosedPage() {
  const storeInfo = useAppStore((s) => s.storeInfo);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold mb-2">{storeInfo?.name ?? 'Магазин'}</h1>
      <p className="text-lg text-gray-600 mb-6">Магазин временно закрыт</p>

      {storeInfo?.workingHours && (
        <div className="bg-gray-50 rounded-xl p-4 w-full max-w-sm">
          <h3 className="font-medium mb-2">Режим работы:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{storeInfo.workingHours}</p>
        </div>
      )}

      <p className="text-gray-500 mt-6 text-sm">Попробуйте зайти позже</p>
    </div>
  );
}
