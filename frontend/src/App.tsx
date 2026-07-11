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

type IngredientForm = {
  name: string
  quantity: string
  status: Ingredient['status']
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

const initialIngredientForm: IngredientForm = {
  name: '',
  quantity: '',
  status: 'fresh',
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
      setSaved({ childInfo: { ...childInfo }, mealSettings: { ...mealSettings } })
      setEditingChildInfo(false)
      setNotification('저장되었습니다!')
      setTimeout(() => setNotification(''), 2000)
      setPage('fridge')
    }
  }

  const handleMealSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved({ childInfo: { ...childInfo }, mealSettings: { ...mealSettings } })
    setPage('fridge')
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
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-40 w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-lg font-semibold shadow-md"
        aria-label="설정 메뉴 열기"
      >
        ⋯
      </button>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute left-4 top-16 w-64 rounded-3xl border border-gray-200 bg-white p-3 shadow-2xl backdrop-blur-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setPage('child-info')
                setEditingChildInfo(true)
                if (saved) {
                  setChildInfo({ ...saved.childInfo })
                }
                setIsMenuOpen(false)
              }}
              className="w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              아이 정보 수정
            </button>
            <button
              type="button"
              onClick={() => {
                setPage('meal-settings')
                setIsMenuOpen(false)
              }}
              className="w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              식단 설정 수정
            </button>
            <button
              type="button"
              onClick={() => {
                setPage('fridge')
                setIsMenuOpen(false)
              }}
              className="w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              식재료 관리
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-2xl px-6 pb-10 pt-16 text-left">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-lg p-6">
        {page === 'home' && (
          <div>
            <h1 className="mb-6 text-3xl font-bold">홈</h1>
            <div className="space-y-4">
              <p className="text-gray-600">
                홈에서 시작하면 아이 정보와 식재료 입력 화면으로 순서대로 이동합니다.
              </p>
              <button
                onClick={() => {
                  setPage('child-info')
                  setEditingChildInfo(true)
                }}
                className="w-full rounded-full bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600"
              >
                시작하기
              </button>
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
                  setChildInfo(saved ? { ...saved.childInfo } : initialChildInfo)
                }}
                className="w-full rounded-full bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600"
              >
                수정
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleChildInfoSubmit}
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
                    className="flex-1 rounded-full border border-gray-200 px-4 py-2 font-medium bg-white hover:bg-gray-50"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600"
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
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 font-medium bg-white hover:bg-gray-50"
              >
                뒤로
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600"
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
            className="mt-4 w-full rounded-full bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600"
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
                  className="flex-1 rounded-full bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600"
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
                    className="flex-1 rounded-full border border-gray-200 px-4 py-2 font-medium bg-white hover:bg-gray-50"
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
                        className="rounded-full bg-rose-500 px-3 py-1 text-sm font-medium text-white hover:bg-rose-600"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteIngredient(item.id)}
                        className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
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
      </div>
    </main>

    </div>
  )
}

export default App
