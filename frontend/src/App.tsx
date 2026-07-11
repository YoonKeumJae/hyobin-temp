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

// ponytail: shared style strings — one source of truth for the cute theme
const btnPrimary =
  'rounded-full bg-coral px-5 py-2.5 font-bold text-white shadow-md shadow-coral/30 transition hover:bg-coral-deep hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
const btnGhost =
  'rounded-full border-2 border-butter bg-white/70 px-5 py-2.5 font-bold text-cocoa-strong transition hover:bg-cream hover:-translate-y-0.5 active:translate-y-0'
const inputBase =
  'w-full rounded-2xl border-2 border-butter bg-white px-4 py-2.5 text-cocoa-strong placeholder:text-cocoa/40 transition focus:border-coral focus:outline-none focus:ring-4 focus:ring-coral/15'
const fieldLabel = 'mb-1.5 block text-sm font-bold text-cocoa'

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
      fresh: '🌱 신선함',
      soon: '⏳ 곧 상할 예정',
      expired: '💧 상함',
    }
    return labels[status]
  }

  const getStatusColor = (status: Ingredient['status']) => {
    const colors = {
      fresh: 'bg-mint text-mint-ink',
      soon: 'bg-honey text-honey-ink',
      expired: 'bg-rose text-rose-ink',
    }
    return colors[status]
  }

  return (
    <div className="min-h-screen">
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-butter bg-white/80 text-xl font-bold text-cocoa-strong shadow-md shadow-peach/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-cream"
        aria-label="설정 메뉴 열기"
      >
        ⋯
      </button>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-cocoa-strong/20"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute left-4 top-16 w-64 rounded-3xl border-2 border-butter bg-white p-3 shadow-2xl shadow-peach/30"
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
              className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-cocoa-strong transition hover:bg-blush"
            >
              👶 아이 정보 수정
            </button>
            <button
              type="button"
              onClick={() => {
                setPage('meal-settings')
                setIsMenuOpen(false)
              }}
              className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-cocoa-strong transition hover:bg-blush"
            >
              🍽️ 식단 설정 수정
            </button>
            <button
              type="button"
              onClick={() => {
                setPage('fridge')
                setIsMenuOpen(false)
              }}
              className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-cocoa-strong transition hover:bg-blush"
            >
              🧺 식재료 관리
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-2xl px-6 pb-12 pt-16 text-left">
        <header className="mb-5 flex items-center justify-center gap-2 text-center">
          <span className="text-3xl">🍳</span>
          <span className="text-lg font-extrabold tracking-tight text-cocoa-strong">
            우리 아이 식단표
          </span>
        </header>

        <div className="rounded-[2rem] border-2 border-white bg-white/80 p-6 shadow-xl shadow-peach/20 backdrop-blur-sm">
        {page === 'home' && (
          <div>
            <div className="mb-4 text-center text-5xl">🧸</div>
            <h1 className="mb-4 text-center text-3xl font-extrabold">환영해요!</h1>
            <div className="space-y-4">
              <p className="rounded-2xl bg-cream px-4 py-3 text-center text-cocoa">
                홈에서 시작하면 아이 정보와 식재료 입력 화면으로
                <br />
                순서대로 이동해요 😊
              </p>
              <button
                onClick={() => {
                  setPage('child-info')
                  setEditingChildInfo(true)
                }}
                className={`w-full ${btnPrimary}`}
              >
                시작하기 ✨
              </button>
            </div>
          </div>
        )}

      {page === 'child-info' && (
        <div>
          <h1 className="mb-5 flex items-center gap-2 text-3xl font-extrabold">
            <span>👶</span> 아이 정보
          </h1>
          {notification && (
            <div className="mb-4 rounded-2xl bg-mint px-4 py-3 font-bold text-mint-ink">
              🎉 {notification}
            </div>
          )}

          {saved && !editingChildInfo ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-2xl bg-cream px-4 py-3">
                  <p className="text-sm font-bold text-cocoa">생년월일</p>
                  <p className="mt-1 text-lg text-cocoa-strong">{saved.childInfo.birthDate}</p>
                </div>
                <div className="rounded-2xl bg-cream px-4 py-3">
                  <p className="text-sm font-bold text-cocoa">못먹는 음식</p>
                  <p className="mt-1 text-lg text-cocoa-strong">{saved.childInfo.dislikedFoods || '-'}</p>
                </div>
                <div className="rounded-2xl bg-cream px-4 py-3">
                  <p className="text-sm font-bold text-cocoa">좋아하는 음식</p>
                  <p className="mt-1 text-lg text-cocoa-strong">{saved.childInfo.likedFoods || '-'}</p>
                </div>
                <div className="rounded-2xl bg-cream px-4 py-3">
                  <p className="text-sm font-bold text-cocoa">알러지</p>
                  <p className="mt-1 text-lg text-cocoa-strong">{saved.childInfo.allergies || '-'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingChildInfo(true)
                  setChildInfo(saved ? { ...saved.childInfo } : initialChildInfo)
                }}
                className={`w-full ${btnPrimary}`}
              >
                수정하기 ✏️
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleChildInfoSubmit}
              className="space-y-4"
            >
              <label className="block">
                <span className={fieldLabel}>생년월일</span>
                <input
                  type="date"
                  value={childInfo.birthDate}
                  onChange={handleChildInfoChange('birthDate')}
                  className={inputBase}
                />
              </label>

              <label className="block">
                <span className={fieldLabel}>못먹는 음식</span>
                <input
                  type="text"
                  value={childInfo.dislikedFoods}
                  onChange={handleChildInfoChange('dislikedFoods')}
                  className={inputBase}
                  placeholder="예: 고수, 가지"
                />
              </label>

              <label className="block">
                <span className={fieldLabel}>좋아하는 음식</span>
                <input
                  type="text"
                  value={childInfo.likedFoods}
                  onChange={handleChildInfoChange('likedFoods')}
                  className={inputBase}
                  placeholder="예: 계란, 치즈"
                />
              </label>

              <label className="block">
                <span className={fieldLabel}>알러지</span>
                <input
                  type="text"
                  value={childInfo.allergies}
                  onChange={handleChildInfoChange('allergies')}
                  className={inputBase}
                  placeholder="예: 땅콩, 갑각류"
                />
              </label>

              <div className="flex gap-3">
                {editingChildInfo && (
                  <button
                    type="button"
                    onClick={() => setEditingChildInfo(false)}
                    className={`flex-1 ${btnGhost}`}
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 ${btnPrimary}`}
                >
                  저장 💛
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {page === 'meal-settings' && (
        <div>
          <h1 className="mb-5 flex items-center gap-2 text-3xl font-extrabold">
            <span>🍽️</span> 식단 설정
          </h1>
          <form onSubmit={handleMealSettingsSubmit} className="space-y-4">
            <label className="block">
              <span className={fieldLabel}>며칠분 식단을 만들지</span>
              <input
                type="number"
                min="1"
                max="7"
                value={mealSettings.daysForMeal}
                onChange={handleMealSettingsChange('daysForMeal')}
                className={inputBase}
                placeholder="1~7"
              />
            </label>

            <label className="block">
              <span className={fieldLabel}>재료</span>
              <textarea
                value={mealSettings.ingredients}
                onChange={handleMealSettingsChange('ingredients')}
                className={`min-h-24 ${inputBase}`}
                placeholder="예: 닭가슴살, 양파, 마늘"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage('child-info')}
                className={`flex-1 ${btnGhost}`}
              >
                뒤로
              </button>
              <button
                type="submit"
                className={`flex-1 ${btnPrimary}`}
              >
                완료 🎈
              </button>
            </div>
          </form>
        </div>
      )}

      {page === 'result' && saved && (
        <div>
          <h1 className="mb-5 flex items-center gap-2 text-3xl font-extrabold">
            <span>📋</span> 입력 결과
          </h1>
          <section className="rounded-2xl border-2 border-butter bg-cream p-5">
            <h2 className="mb-3 text-lg font-extrabold">👶 아이 정보</h2>
            <p>생년월일: {saved.childInfo.birthDate || '-'}</p>
            <p>못먹는 음식: {saved.childInfo.dislikedFoods || '-'}</p>
            <p>좋아하는 음식: {saved.childInfo.likedFoods || '-'}</p>
            <p>알러지: {saved.childInfo.allergies || '-'}</p>
          </section>

          <section className="mt-4 rounded-2xl border-2 border-butter bg-cream p-5">
            <h2 className="mb-3 text-lg font-extrabold">🍽️ 식단 설정</h2>
            <p>며칠분 식단: {saved.mealSettings.daysForMeal || '-'}일</p>
            <p>재료: {saved.mealSettings.ingredients || '-'}</p>
          </section>

          <button
            onClick={() => {
              setPage('home')
              const savedBirthDate = saved?.childInfo.birthDate ?? childInfo.birthDate
              setChildInfo({ ...initialChildInfo, birthDate: savedBirthDate })
              setMealSettings(initialMealSettings)
              setSaved(null)
              setFridgeItems([])
            }}
            className={`mt-4 w-full ${btnPrimary}`}
          >
            처음으로 🏠
          </button>
        </div>
      )}

      {page === 'fridge' && (
        <div>
          <h1 className="mb-5 flex items-center gap-2 text-3xl font-extrabold">
            <span>🧺</span> 냉장고 관리
          </h1>

          <div className="mb-6 rounded-2xl border-2 border-butter bg-cream p-5">
            <h2 className="mb-4 text-lg font-extrabold">
              {editingId ? '✏️ 재료 수정' : '➕ 재료 추가'}
            </h2>
            <form onSubmit={handleAddIngredient} className="space-y-3">
              <label className="block">
                <span className={fieldLabel}>재료 이름</span>
                <input
                  type="text"
                  value={ingredientForm.name}
                  onChange={handleIngredientFormChange('name')}
                  className={inputBase}
                  placeholder="예: 닭가슴살"
                />
              </label>

              <label className="block">
                <span className={fieldLabel}>양</span>
                <input
                  type="text"
                  value={ingredientForm.quantity}
                  onChange={handleIngredientFormChange('quantity')}
                  className={inputBase}
                  placeholder="예: 500g, 2개"
                />
              </label>

              <label className="block">
                <span className={fieldLabel}>상태</span>
                <select
                  value={ingredientForm.status}
                  onChange={handleIngredientFormChange('status')}
                  className={inputBase}
                >
                  <option value="fresh">🌱 신선함</option>
                  <option value="soon">⏳ 곧 상할 예정</option>
                  <option value="expired">💧 상함</option>
                </select>
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 ${btnPrimary}`}
                >
                  {editingId ? '수정 ✏️' : '추가 ➕'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setIngredientForm(initialIngredientForm)
                    }}
                    className={`flex-1 ${btnGhost}`}
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-extrabold">🥕 재료 목록</h2>
            {fridgeItems.length === 0 ? (
              <div className="rounded-2xl bg-cream px-4 py-8 text-center text-cocoa">
                <div className="mb-2 text-4xl">🫙</div>
                아직 저장된 재료가 없어요.
              </div>
            ) : (
              <div className="space-y-2.5">
                {fridgeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border-2 border-butter bg-white p-4 shadow-sm shadow-peach/20"
                  >
                    <div className="flex-1">
                      <p className="font-extrabold text-cocoa-strong">{item.name}</p>
                      <p className="text-sm text-cocoa">{item.quantity}</p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex gap-2">
                      <button
                        onClick={() => handleEditIngredient(item)}
                        className="rounded-full bg-coral px-3.5 py-1.5 text-sm font-bold text-white shadow-sm shadow-coral/30 transition hover:bg-coral-deep"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteIngredient(item.id)}
                        className="rounded-full bg-rose px-3.5 py-1.5 text-sm font-bold text-rose-ink transition hover:bg-rose-ink hover:text-white"
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
