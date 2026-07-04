import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type ChildInfo = {
  birthDate: string
  dislikedFoods: string
  likedFoods: string
  allergies: string
}

type MealSettings = {
  daysForMeal: string
  ingredients: string
}

type Ingredient = {
  id: string
  name: string
  quantity: string
  status: 'fresh' | 'soon' | 'expired'
}

type Page = 'home' | 'child-info' | 'meal-settings' | 'result' | 'fridge'

const initialChildInfo: ChildInfo = {
  birthDate: '',
  dislikedFoods: '',
  likedFoods: '',
  allergies: '',
}

const initialMealSettings: MealSettings = {
  daysForMeal: '7',
  ingredients: '',
}

const initialIngredientForm = {
  name: '',
  quantity: '',
  status: 'fresh' as const,
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [childInfo, setChildInfo] = useState<ChildInfo>(initialChildInfo)
  const [mealSettings, setMealSettings] = useState<MealSettings>(initialMealSettings)
  const [saved, setSaved] = useState<{
    childInfo: ChildInfo
    mealSettings: MealSettings
  } | null>(null)
  const [fridgeItems, setFridgeItems] = useState<Ingredient[]>([])
  const [ingredientForm, setIngredientForm] = useState(initialIngredientForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingChildInfo, setEditingChildInfo] = useState(false)
  const [notification, setNotification] = useState('')

  const handleChildInfoChange =
    (key: keyof ChildInfo) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setChildInfo((prev) => ({ ...prev, [key]: event.target.value }))
    }

  const handleMealSettingsChange =
    (key: keyof MealSettings) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setMealSettings((prev) => ({ ...prev, [key]: event.target.value }))
    }

  const handleChildInfoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (childInfo.birthDate) {
      setPage('meal-settings')
    }
  }

  const handleMealSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved({ childInfo, mealSettings })
    setPage('result')
  }

  const handleReturnToHome = () => {
    setPage('home')
    setSaved(null)
  }

  const handleIngredientFormChange =
    (key: keyof typeof initialIngredientForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setIngredientForm((prev) => ({ ...prev, [key]: event.target.value }))
    }

  const handleAddIngredient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (ingredientForm.name.trim() && ingredientForm.quantity.trim()) {
      if (editingId) {
        setFridgeItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  name: ingredientForm.name,
                  quantity: ingredientForm.quantity,
                  status: ingredientForm.status,
                }
              : item
          )
        )
        setEditingId(null)
      } else {
        const newItem: Ingredient = {
          id: Date.now().toString(),
          name: ingredientForm.name,
          quantity: ingredientForm.quantity,
          status: ingredientForm.status,
        }
        setFridgeItems((prev) => [...prev, newItem])
      }
      setIngredientForm(initialIngredientForm)
    }
  }

  const handleEditIngredient = (item: Ingredient) => {
    setIngredientForm({
      name: item.name,
      quantity: item.quantity,
      status: item.status,
    })
    setEditingId(item.id)
  }

  const handleDeleteIngredient = (id: string) => {
    setFridgeItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getStatusLabel = (status: Ingredient['status']) => {
    const labels = {
      fresh: '신선함',
      soon: '곧 상할 예정',
      expired: '상함',
    }
    return labels[status]
  }

  const getStatusColor = (status: Ingredient['status']) => {
    const colors = {
      fresh: 'bg-green-100 text-green-800',
      soon: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 text-left">
        {page === 'home' && (
          <div>
            <h1 className="mb-6 text-3xl font-bold">홈</h1>
            <div className="space-y-3">
              <p className="text-gray-600">메뉴에서 "아이 정보" 탭을 선택하여 시작하세요.</p>
            </div>
          </div>
        )}

      {page === 'child-info' && (
        <div>
          {notification && (
            <div className="mb-4 rounded bg-green-100 p-3 text-green-800">
              {notification}
            </div>
          )}
          
          {saved && !editingChildInfo ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">생년월일</p>
                  <p className="mt-1 text-lg">{saved.childInfo.birthDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">못먹는 음식</p>
                  <p className="mt-1 text-lg">{saved.childInfo.dislikedFoods || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">좋아하는 음식</p>
                  <p className="mt-1 text-lg">{saved.childInfo.likedFoods || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">알러지</p>
                  <p className="mt-1 text-lg">{saved.childInfo.allergies || '-'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingChildInfo(true)
                  setChildInfo(saved.childInfo)
                }}
                className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                수정
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (childInfo.birthDate) {
                  setSaved({ childInfo, mealSettings })
                  setEditingChildInfo(false)
                  setNotification('저장되었습니다!')
                  setTimeout(() => setNotification(''), 2000)
                }
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-1 block text-sm font-medium">생년월일</span>
                <input
                  type="date"
                  value={childInfo.birthDate}
                  onChange={handleChildInfoChange('birthDate')}
                  className="w-full rounded border px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">못먹는 음식</span>
                <input
                  type="text"
                  value={childInfo.dislikedFoods}
                  onChange={handleChildInfoChange('dislikedFoods')}
                  className="w-full rounded border px-3 py-2"
                  placeholder="예: 고수, 가지"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">좋아하는 음식</span>
                <input
                  type="text"
                  value={childInfo.likedFoods}
                  onChange={handleChildInfoChange('likedFoods')}
                  className="w-full rounded border px-3 py-2"
                  placeholder="예: 계란, 치즈"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">알러지</span>
                <input
                  type="text"
                  value={childInfo.allergies}
                  onChange={handleChildInfoChange('allergies')}
                  className="w-full rounded border px-3 py-2"
                  placeholder="예: 땅콩, 갑각류"
                />
              </label>

              <div className="flex gap-3">
                {editingChildInfo && (
                  <button
                    type="button"
                    onClick={() => setEditingChildInfo(false)}
                    className="flex-1 rounded border px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 rounded bg-black px-4 py-2 font-medium text-white"
                >
                  저장
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {page === 'meal-settings' && (
        <div>
          <h1 className="mb-6 text-3xl font-bold">식단 설정</h1>
          <form onSubmit={handleMealSettingsSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">며칠분 식단을 만들지</span>
              <input
                type="number"
                min="1"
                max="7"
                value={mealSettings.daysForMeal}
                onChange={handleMealSettingsChange('daysForMeal')}
                className="w-full rounded border px-3 py-2"
                placeholder="1~7"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">재료</span>
              <textarea
                value={mealSettings.ingredients}
                onChange={handleMealSettingsChange('ingredients')}
                className="min-h-24 w-full rounded border px-3 py-2"
                placeholder="예: 닭가슴살, 양파, 마늘"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage('child-info')}
                className="flex-1 rounded border px-4 py-2 font-medium hover:bg-gray-100"
              >
                뒤로
              </button>
              <button
                type="submit"
                className="flex-1 rounded bg-black px-4 py-2 font-medium text-white"
              >
                완료
              </button>
            </div>
          </form>
        </div>
      )}

      {page === 'result' && saved && (
        <div>
          <h1 className="mb-6 text-3xl font-bold">입력 결과</h1>
          <section className="rounded border p-4">
            <h2 className="mb-3 text-lg font-semibold">아이 정보</h2>
            <p>생년월일: {saved.childInfo.birthDate || '-'}</p>
            <p>못먹는 음식: {saved.childInfo.dislikedFoods || '-'}</p>
            <p>좋아하는 음식: {saved.childInfo.likedFoods || '-'}</p>
            <p>알러지: {saved.childInfo.allergies || '-'}</p>
          </section>

          <section className="mt-4 rounded border p-4">
            <h2 className="mb-3 text-lg font-semibold">식단 설정</h2>
            <p>며칠분 식단: {saved.mealSettings.daysForMeal || '-'}일</p>
            <p>재료: {saved.mealSettings.ingredients || '-'}</p>
          </section>

          <button
            onClick={() => {
              setPage('home')
              const savedBirthDate = childInfo.birthDate
              setChildInfo({ ...initialChildInfo, birthDate: savedBirthDate })
              setMealSettings(initialMealSettings)
              setSaved(null)
            }}
            className="mt-4 w-full rounded bg-black px-4 py-2 font-medium text-white"
          >
            처음으로
          </button>
        </div>
      )}

      {page === 'fridge' && (
        <div>
          <h1 className="mb-6 text-3xl font-bold">냉장고 관리</h1>
          
          <div className="mb-6 rounded border p-4">
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? '재료 수정' : '재료 추가'}
            </h2>
            <form onSubmit={handleAddIngredient} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">재료 이름</span>
                <input
                  type="text"
                  value={ingredientForm.name}
                  onChange={handleIngredientFormChange('name')}
                  className="w-full rounded border px-3 py-2"
                  placeholder="예: 닭가슴살"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">양</span>
                <input
                  type="text"
                  value={ingredientForm.quantity}
                  onChange={handleIngredientFormChange('quantity')}
                  className="w-full rounded border px-3 py-2"
                  placeholder="예: 500g, 2개"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">상태</span>
                <select
                  value={ingredientForm.status}
                  onChange={handleIngredientFormChange('status')}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="fresh">신선함</option>
                  <option value="soon">곧 상할 예정</option>
                  <option value="expired">상함</option>
                </select>
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  {editingId ? '수정' : '추가'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setIngredientForm(initialIngredientForm)
                    }}
                    className="flex-1 rounded border px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">재료 목록</h2>
            {fridgeItems.length === 0 ? (
              <p className="text-gray-600">저장된 재료가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {fridgeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.quantity}</p>
                      <span
                        className={`mt-1 inline-block rounded px-2 py-1 text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="ml-3 flex gap-2">
                      <button
                        onClick={() => handleEditIngredient(item)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteIngredient(item.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex max-w-2xl">
          <button
            onClick={() => {
              setPage('home')
              setSaved(null)
            }}
            className={`flex-1 px-4 py-3 text-center font-medium ${
              page === 'home'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            홈
          </button>
          <button
            onClick={() => setPage('child-info')}
            className={`flex-1 px-4 py-3 text-center font-medium ${
              page === 'child-info'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            아이 정보
          </button>
          <button
            onClick={() => setPage('fridge')}
            className={`flex-1 px-4 py-3 text-center font-medium ${
              page === 'fridge'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            냉장고 관리
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
