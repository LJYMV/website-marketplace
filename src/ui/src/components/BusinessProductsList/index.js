import React, { useState, useRef } from 'react'

import {
  ProductsContainer,
  ProductsListing,
  WrapAllCategories,
  ErrorMessage,
  WrapperNotFound,
  HeaderWrapper,
  DescriptionModalContainer,
  RibbonBox,
  CategoryDescription,
  DescriptionContainer,
  SubcategorySearchContainer,
  PreviouslyOrderedContainer,
  PreviouslyOrderedWrapper
} from './styles'

import { SubcategoriesComponent } from './SubcategoriesComponent'
import { ProductsList, useConfig, useLanguage } from '~components'
import {
  SingleProductCard,
  NotFoundSource,
  Modal,
  shape,
  AutoScroll
} from '~ui'

const BusinessProductsListUI = (props) => {
  const {
    errors,
    businessId,
    isLazy,
    category,
    categories,
    categoryState,
    isBusinessLoading,
    onProductClick,
    handleSearchRedirect,
    featured,
    useKioskApp,
    searchValue,
    isCartOnProductsList,
    handleClearSearch,
    errorQuantityProducts,
    currentCart,
    setSubcategoriesSelected,
    subcategoriesSelected,
    onClickCategory,
    handleUpdateProducts,
    isSearchMode,
    business,
    previouslyProducts
  } = props

  const [, t] = useLanguage()
  const [{ configs }] = useConfig()
  const isUseParentCategory = configs?.use_parent_category?.value === 'true' || configs?.use_parent_category?.value === '1'
  const [openDescription, setOpenDescription] = useState(null)
  const headerRef = useRef()

  const onClickSubcategory = (subCategory, parentCategory) => {
    if (parentCategory && isLazy) {
      onClickCategory(parentCategory)
    }
    if (!subCategory) {
      setSubcategoriesSelected(subcategoriesSelected?.filter(_subcategory => _subcategory?.parent_category_id !== parentCategory?.id))
      return
    }
    const categoryFounded = subcategoriesSelected?.find(_subcategory => subCategory?.id === _subcategory?.id)
    if (categoryFounded) {
      setSubcategoriesSelected(subcategoriesSelected?.filter(_subcategory => subCategory?.id !== _subcategory?.id))
    } else {
      setSubcategoriesSelected([...subcategoriesSelected, subCategory])
    }
  }

  const productsCategorySelected = categoryState.products
    ?.filter(product =>
      !subcategoriesSelected?.find(subcategory => subcategory?.parent_category_id === category?.id) ||
      subcategoriesSelected?.some(subcategory => subcategory.id === product?.category_id))

  return (
    <>
      <ProductsContainer>
        {category?.id && (
          <>
            <HeaderWrapper>
              {category?.subcategories?.length > 0 && !isSearchMode && (
                <SubcategoriesComponent
                  category={category}
                  subcategoriesSelected={subcategoriesSelected}
                  onClickSubcategory={onClickSubcategory}
                />
              )}
            </HeaderWrapper>
            <ProductsListing>
              {productsCategorySelected.map((product, i) => (
                <SingleProductCard
                  key={i}
                  isSoldOut={(product.inventoried && !product.quantity)}
                  product={product}
                  useKioskApp={useKioskApp}
                  businessId={businessId}
                  onProductClick={onProductClick}
                  isCartOnProductsList={isCartOnProductsList}
                  handleUpdateProducts={handleUpdateProducts}
                  productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                />
              ))}
            </ProductsListing>
            {isSearchMode && category?.subcategories?.length > 0 && category?.subcategories?.filter(subcategory => productsCategorySelected?.some(product => product?.category_id === subcategory?.id))?.map(subcategory => (
              <SubcategorySearchContainer key={subcategory?.id}>
                <h4>{subcategory?.name}</h4>
                <ProductsListing isSubcategorySearch>
                  {productsCategorySelected?.filter(product => product?.category_id === subcategory?.id)?.map((product, i) => (
                    <SingleProductCard
                      key={i}
                      isSoldOut={product.inventoried && !product.quantity}
                      businessId={businessId}
                      product={product}
                      onProductClick={onProductClick}
                      isCartOnProductsList={isCartOnProductsList}
                      handleUpdateProducts={handleUpdateProducts}
                      useKioskApp={useKioskApp}
                      productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                    />
                  ))}
                </ProductsListing>
              </SubcategorySearchContainer>
            ))}
          </>
        )}
        {
          !category?.id && previouslyProducts?.length > 0 && (
            <WrapAllCategories id='previously_block'>
              <h3>{t('ORDER_IT_AGAIN', 'Order it again')}</h3>
              <CategoryDescription maxWidth={headerRef?.current?.clientWidth}>
                <p>
                  {t('ORDER_IT_AGAIN_DESC', 'Quickly add items from your past orders.')}
                </p>
              </CategoryDescription>
              <PreviouslyOrderedContainer>
                <PreviouslyOrderedWrapper>
                  <AutoScroll scrollId='previously_ordered'>
                    {previouslyProducts?.map((product, i) => (
                      <SingleProductCard
                        key={i}
                        isSoldOut={(product.inventoried && !product.quantity)}
                        product={product}
                        useKioskApp={useKioskApp}
                        businessId={businessId}
                        onProductClick={onProductClick}
                        isCartOnProductsList={isCartOnProductsList}
                        handleUpdateProducts={handleUpdateProducts}
                        productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                      />
                    ))}
                  </AutoScroll>
                </PreviouslyOrderedWrapper>
              </PreviouslyOrderedContainer>
            </WrapAllCategories>
          )
        }
        {
          !category?.id && (
            <>
              {
                featured && categoryState?.products?.find(product => product.featured) && (
                  <WrapAllCategories id='categoryfeatured'>
                    <h3>{t('FEATURED', 'Featured')}</h3>
                    <ProductsListing>
                      {categoryState.products?.map((product, i) => product.featured && (
                        <SingleProductCard
                          key={i}
                          isSoldOut={(product.inventoried && !product.quantity)}
                          product={product}
                          useKioskApp={useKioskApp}
                          businessId={businessId}
                          onProductClick={onProductClick}
                          isCartOnProductsList={isCartOnProductsList}
                          handleUpdateProducts={handleUpdateProducts}
                          productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                        />
                      ))}
                      {!business?.food && !categoryState?.loading && categoryState?.products?.filter(product => product.featured)?.length > 9 && (
                        <SingleProductCard
                          useCustomFunctionality
                          onCustomClick={() => onClickCategory(category)}
                          isCartOnProductsList={isCartOnProductsList}
                          handleUpdateProducts={handleUpdateProducts}
                          customText={t('MORE', 'More')}
                          customStyle={{
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        />
                      )}
                    </ProductsListing>
                  </WrapAllCategories>
                )
              }
            </>
          )
        }

        {
          !category?.id && categories.filter(category => category?.id !== null).map((category, i, _categories) => {
            const _products = !isUseParentCategory
              ? categoryState?.products?.filter(product => product?.category_id === category?.id) ?? []
              : categoryState?.products?.filter(product => category?.children?.some(cat => cat.category_id === product?.category_id)) ?? []
            const products = subcategoriesSelected?.length > 0
              ? _products?.filter(product =>
                !subcategoriesSelected?.find(subcategory => subcategory?.parent_category_id === category?.id) ||
                subcategoriesSelected.some(subcategory => subcategory?.id === product?.category_id || subcategory?.children?.reduce((prev, cur) => [...prev, cur?.category_id], [])?.includes(product?.category_id)))
              : _products
            const shortCategoryDescription = category?.description?.length > 200 ? `${category?.description?.substring(0, 200)}...` : category?.description
            const isSubcategorySearch = isSearchMode && category?.subcategories?.length > 0 && category?.subcategories?.some(subcategory => products?.some(product => product?.category_id === subcategory?.id))
            return (
              <React.Fragment key={i}>
                {
                  products.length > 0 && (
                    <WrapAllCategories id={`category${category?.id}`}>
                      <HeaderWrapper ref={headerRef}>
                        <div className='category-title'>
                          {
                            category?.image && (
                              <img src={category.image} />
                            )
                          }
                          <h3>{category.name}</h3>
                          {category?.ribbon?.enabled && (
                            <RibbonBox
                              bgColor={category?.ribbon?.color}
                              isRoundRect={category?.ribbon?.shape === shape?.rectangleRound}
                              isCapsule={category?.ribbon?.shape === shape?.capsuleShape}
                            >
                              {category?.ribbon?.text}
                            </RibbonBox>
                          )}
                        </div>
                        {category?.description && (
                          <CategoryDescription maxWidth={headerRef?.current?.clientWidth}>
                            <p>
                              {shortCategoryDescription}
                            </p>
                            {category?.description?.length > 200 && (
                              <span onClick={() => setOpenDescription(category)}>{t('VIEW_MORE', 'View more')}</span>
                            )}
                          </CategoryDescription>
                        )}
                        {category?.subcategories?.length > 0 && !isSearchMode && (
                          <SubcategoriesComponent
                            category={category}
                            subcategoriesSelected={subcategoriesSelected}
                            onClickSubcategory={onClickSubcategory}
                          />
                        )}
                      </HeaderWrapper>
                      <ProductsListing isSubcategorySearch={isSubcategorySearch}>
                        {isSearchMode && category?.subcategories?.length > 0
                          ? (
                          <>
                            {products?.sort((a, b) => (a.name || 0) - (b.name || 0)).filter((product, i) => (i < 9 && product?.category_id === category?.id) || business?.food)?.map((product, i) => (
                              <SingleProductCard
                                key={i}
                                isSoldOut={product.inventoried && !product.quantity}
                                businessId={businessId}
                                product={product}
                                onProductClick={onProductClick}
                                useKioskApp={useKioskApp}
                                isCartOnProductsList={isCartOnProductsList}
                                handleUpdateProducts={handleUpdateProducts}
                                productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                              />
                            ))}
                            {!business?.food && !categoryState?.loading && products?.length > 9 && (
                              <SingleProductCard
                                useCustomFunctionality
                                onCustomClick={() => onClickCategory(category)}
                                isCartOnProductsList={isCartOnProductsList}
                                handleUpdateProducts={handleUpdateProducts}
                                customText={t('MORE', 'More')}
                                customStyle={{
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}
                              />
                            )}
                          </>
                            )
                          : (
                          <>
                            {
                              products?.sort((a, b) => (a.name || 0) - (b.name || 0)).filter((_, i) => i < 9 || business?.food).map((product, i) => (
                                <SingleProductCard
                                  key={i}
                                  isSoldOut={product.inventoried && !product.quantity}
                                  businessId={businessId}
                                  product={product}
                                  onProductClick={onProductClick}
                                  useKioskApp={useKioskApp}
                                  isCartOnProductsList={isCartOnProductsList}
                                  handleUpdateProducts={handleUpdateProducts}
                                  productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                                />
                              ))
                            }
                            {!business?.food && !categoryState?.loading && products?.length > 9 && (
                              <SingleProductCard
                                useCustomFunctionality
                                onCustomClick={() => onClickCategory(category)}
                                isCartOnProductsList={isCartOnProductsList}
                                handleUpdateProducts={handleUpdateProducts}
                                customText={t('MORE', 'More')}
                                customStyle={{
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}
                              />
                            )}
                          </>
                            )}
                        {
                          categoryState.loading && (i + 1) === _categories.length && [...Array(categoryState.pagination.nextPageItems).keys()].map(i => (
                            <SingleProductCard
                              key={`skeleton:${i}`}
                              isSkeleton
                            />
                          ))
                        }
                      </ProductsListing>
                      {isSearchMode && category?.subcategories?.length > 0 && category?.subcategories?.filter(subcategory => products?.some(product => product?.category_id === subcategory?.id))?.map(subcategory => (
                        <SubcategorySearchContainer key={subcategory?.id}>
                          <h4>{subcategory?.name}</h4>
                          <ProductsListing isSubcategorySearch={isSubcategorySearch}>
                            {products?.filter(product => product?.category_id === subcategory?.id)?.map((product, i) => (
                              <SingleProductCard
                                key={i}
                                isSoldOut={product.inventoried && !product.quantity}
                                businessId={businessId}
                                product={product}
                                onProductClick={onProductClick}
                                isCartOnProductsList={isCartOnProductsList}
                                handleUpdateProducts={handleUpdateProducts}
                                useKioskApp={useKioskApp}
                                productAddedToCartLength={currentCart?.products?.reduce((productsLength, Cproduct) => { return productsLength + (Cproduct?.id === product?.id ? Cproduct?.quantity : 0) }, 0)}
                              />
                            ))}
                          </ProductsListing>
                        </SubcategorySearchContainer>
                      ))}
                    </WrapAllCategories>
                  )
                }
              </React.Fragment>
            )
          })
        }

        {
          (categoryState.loading || isBusinessLoading) && (
            <ProductsListing>
              {[...Array(useKioskApp ? 24 : categoryState.pagination.nextPageItems).keys()].map(i => (
                <SingleProductCard
                  key={`skeleton:${i}`}
                  isSkeleton
                />
              ))}
            </ProductsListing>
          )
        }

        {
          !categoryState?.loading && !isBusinessLoading && categoryState?.products?.length === 0 && !((!searchValue && !errorQuantityProducts)) && (
            <WrapperNotFound>
              <NotFoundSource
                content={!searchValue ? t('ERROR_NOT_FOUND_PRODUCTS_TIME', 'No products found at this time') : t('ERROR_NOT_FOUND_PRODUCTS', 'No products found, please change filters.')}
                btnTitle={!searchValue ? t('SEARCH_REDIRECT', 'Go to Businesses') : t('CLEAR_FILTERS', 'Clear filters')}
                onClickButton={() => !searchValue ? handleSearchRedirect() : handleClearSearch('')}
              />
            </WrapperNotFound>
          )
        }

        {errors && errors.length > 0 && (
          (typeof errors === 'string' ? [errors] : errors).map((e, i) => (
            <ErrorMessage key={i}>ERROR: [{e}]</ErrorMessage>
          ))
        )}
        {openDescription && (
          <Modal
            open={openDescription}
            title={openDescription?.name}
            onClose={() => setOpenDescription(null)}
          >
            <DescriptionModalContainer>
              {
                openDescription?.image && (
                  <img src={openDescription.image} />
                )
              }
              <DescriptionContainer>
                <div>
                  <p>{openDescription?.description}</p>
                </div>
              </DescriptionContainer>
            </DescriptionModalContainer>
          </Modal>
        )}
      </ProductsContainer>
    </>
  )
}

export const BusinessProductsList = (props) => {
  const businessProductsListProps = {
    ...props,
    UIComponent: BusinessProductsListUI
  }

  return (
    <ProductsList {...businessProductsListProps} />
  )
}
