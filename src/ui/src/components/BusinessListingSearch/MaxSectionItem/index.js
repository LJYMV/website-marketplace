import React from 'react'
import { MaxFilterContainer, MaxItem, MaxItemContainer, ProgressBar, ProgressContentWrapper } from '../styles'
import { useConfig, useLanguage, useUtils } from '~components'
import { FilterAccordion } from '../Accordion'
import { capitalize } from '~ui'

export const MaxSectionItem = (props) => {
  const {
    filters,
    handleChangeFilters,
    title,
    options,
    filter
  } = props

  const [, t] = useLanguage()
  const [{ parsePrice }] = useUtils()
  const [{ configs }] = useConfig()

  const distanceUnit = configs?.distance_unit?.value

  const units = {
    mi: 1609,
    km: 1000
  }

  const parseValue = (option) => {
    return filter === 'max_distance'
      ? `${(option / units[distanceUnit]).toFixed(0)} ${t(`${distanceUnit?.toUpperCase()}`, capitalize(distanceUnit))}`
      : filter === 'max_eta'
        ? `${option} ${t('TIME_MIN', 'min')}`
        : parsePrice(option)
  }

  return (
    <MaxFilterContainer>
      <FilterAccordion title={title}>
        <ProgressContentWrapper>
          <ProgressBar style={{ width: `${((options.indexOf(filters?.[filter]) / 3) * 100) ?? 100}%` }} />
        </ProgressContentWrapper>
        <MaxItemContainer>
          {options.map((option, i) => (
            <MaxItem
              key={option}
              active={filters?.[filter] === option || (option === 'default' && (filters?.[filter] === 'default' || !filters?.[filter]))}
              onClick={() => handleChangeFilters(filter, option)}
            >
              {option === 'default' ? `${parseValue(options[i - 1])}+` : parseValue(option)}
            </MaxItem>
          ))}
        </MaxItemContainer>
      </FilterAccordion>
    </MaxFilterContainer>
  )
}
