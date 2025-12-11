import { useMemo, useCallback } from 'react'
import { Settings2, Minus, Plus } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { FontSizeSlider } from './font-size-slider'
import { useReaderStore } from '@/store/reader-store'
import { useAppSettingsStore } from '@/store/app-settings-store'
import { getStyles } from '@/utils/style'

const FONT_SIZE_MIN = 12
const FONT_SIZE_MAX = 32
const FONT_SIZE_STEP = 2

export const SettingsDropdown = () => {
  const setOpenDropdown = useReaderStore((state) => state.setOpenDropdown)
  const openDropdown = useReaderStore((state) => state.openDropdown)
  const view = useReaderStore((state) => state.view)

  const settings = useAppSettingsStore((state) => state.settings)
  const setSettings = useAppSettingsStore((state) => state.setSettings)

  const isSettingsDropdownOpen = useMemo(() => {
    return openDropdown === 'settings'
  }, [openDropdown])

  const updateGlobalViewSettings = useCallback(
    (
      updater: (
        settings: typeof globalViewSettings
      ) => typeof globalViewSettings
    ) => {
      const { settings: currentSettings } = useAppSettingsStore.getState()
      const currentGlobalSettings = currentSettings.globalViewSettings
      const updatedSettings = updater(currentGlobalSettings)
      setSettings({
        ...currentSettings,
        globalViewSettings: updatedSettings,
      })

      const currentView = view
      currentView?.renderer.setStyles?.(getStyles(updatedSettings))
      return updatedSettings
    },
    [setSettings, view]
  )

  const globalViewSettings = settings.globalViewSettings

  const handleToggleSettingsDropdown = useCallback(
    (isOpen: boolean) => {
      setOpenDropdown(isOpen ? 'settings' : null)
    },
    [setOpenDropdown]
  )

  const handleFontSizeChange = useCallback(
    (newSize: number) => {
      const clampedSize = Math.max(
        FONT_SIZE_MIN,
        Math.min(FONT_SIZE_MAX, newSize)
      )

      updateGlobalViewSettings((settings) => ({
        ...settings,
        defaultFontSize: clampedSize,
      }))
    },
    [updateGlobalViewSettings]
  )

  const handleDecreaseFontSize = useCallback(() => {
    handleFontSizeChange(globalViewSettings.defaultFontSize - FONT_SIZE_STEP)
  }, [handleFontSizeChange, globalViewSettings])

  const handleIncreaseFontSize = useCallback(() => {
    handleFontSizeChange(globalViewSettings.defaultFontSize + FONT_SIZE_STEP)
  }, [handleFontSizeChange, globalViewSettings])

  return (
    <DropdownMenu
      open={isSettingsDropdownOpen}
      onOpenChange={handleToggleSettingsDropdown}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 focus-visible:ring-0 focus-visible:ring-offset-0'
        >
          <Settings2 size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-80 p-3'
        align='end'
        side='bottom'
        sideOffset={4}
      >
        <div className='space-y-2'>
          {/* 字体大小 */}
          <div>
            <div className='mb-3 font-medium text-sm'>字体大小</div>
            <div className='flex items-center justify-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={handleDecreaseFontSize}
                disabled={globalViewSettings.defaultFontSize <= FONT_SIZE_MIN}
                title='减小字体大小'
              >
                <Minus size={16} />
              </Button>
              <FontSizeSlider
                value={[globalViewSettings.defaultFontSize]}
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                step={FONT_SIZE_STEP}
                showTooltip
                tooltipContent={(value) => `${value}px`}
                onValueChange={(value: number[]) =>
                  handleFontSizeChange(value[0]!)
                }
              />
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={handleIncreaseFontSize}
                disabled={globalViewSettings.defaultFontSize >= FONT_SIZE_MAX}
                title='增大字体大小'
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
